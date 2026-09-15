module Attachment
  class ShrineImport
    Source = Data.define(:model, :column, :name, :scope, :original_derivative) do
      def klass = model.constantize

      def relation = scope ? scope.call(klass) : klass.all

      def label = "#{model}##{name}"
    end

    SOURCES = [
      Source.new('Track::File', 'file_data', 'file', nil, nil),
      Source.new('GpsRecordingsArchive', 'file_data', 'file', nil, nil),
      Source.new('Profile', 'userpic_data', 'userpic', nil, 'large'),
      Source.new('Place::Photo', 'image_data', 'image', nil, nil),
      Source.new('Sponsor', 'logo_data', 'logo', nil, nil),
      Source.new('Tournament::Competitor', 'photo_data', 'photo', nil, nil),
      Source.new('Tournament::Competitor', 'sponsor_logo_data', 'sponsor_logo', nil, nil),
      Source.new('PerformanceCompetition::Competitor', 'photo_data', 'photo', ->(klass) { klass.joins(:event) }, nil),
      Source.new('Boogie::Competitor', 'photo_data', 'photo', ->(klass) { klass.joins(:event) }, nil),
      Source.new('SpeedSkydivingCompetition::Competitor', 'photo_data', 'photo', nil, nil)
    ].freeze

    BATCH_SIZE = 1000
    MISSING_ERRORS = [Aws::S3::Errors::NotFound, Aws::S3::Errors::Forbidden, Errno::ENOENT].freeze

    Result = Struct.new(:imported, :replaced, :skipped, :missing, keyword_init: true) do
      def self.empty = new(imported: 0, replaced: 0, skipped: 0, missing: [])

      def to_s = "imported=#{imported} replaced=#{replaced} skipped=#{skipped} missing=#{missing.size}"
    end

    def self.call(...) = new(...).call

    def initialize(sources: SOURCES, service: ActiveStorage::Blob.service, cache_root: Rails.public_path.join('system'),
                   logger: nil, dry_run: false)
      @sources = sources
      @service = service
      @cache_root = cache_root
      @logger = logger
      @dry_run = dry_run
    end

    def call
      sources.to_h { |source| [source.label, import_source(source)] }
    end

    private

    attr_reader :sources, :service, :cache_root, :logger, :dry_run

    def import_source(source)
      result = Result.empty

      source_rows(source).each_slice(BATCH_SIZE) do |batch|
        entries = pending_entries(source, batch, result)
        store_entries(source, entries, result) if entries.any?
        logger&.info("#{source.label}: #{result}")
      end

      result
    end

    def source_rows(source)
      table = source.klass.quoted_table_name

      source.relation
            .where.not(source.column => nil)
            .pluck(Arel.sql("#{table}.id"), Arel.sql("#{table}.#{source.column}"))
    end

    def pending_entries(source, batch, result)
      existing = existing_attachments(source, batch.map(&:first))

      batch.filter_map do |record_id, raw_data|
        entry = build_entry(source, record_id, parse(raw_data))
        attachment = existing[record_id]

        if entry.nil?
          result.missing << record_id
          nil
        elsif attachment && !replaceable?(attachment, entry)
          result.skipped += 1
          nil
        else
          entry.merge(replace: attachment)
        end
      end
    end

    def store_entries(source, entries, result)
      replaced = entries.filter_map { |entry| entry[:replace] }
      result.replaced += replaced.size
      result.imported += entries.size - replaced.size
      return if dry_run

      ActiveRecord::Base.transaction do
        ActiveStorage::Attachment.where(id: replaced.map(&:id)).delete_all if replaced.any?
        insert_attachments(source, entries, insert_blobs(entries))
      end
    end

    def insert_blobs(entries)
      blobs = entries.map { |entry| entry[:blob] }.uniq { |blob| blob[:key] }
      blob_ids = ActiveStorage::Blob.where(key: blobs.pluck(:key)).pluck(:key, :id).to_h
      new_blobs = blobs.reject { |blob| blob_ids.key?(blob[:key]) }
      return blob_ids if new_blobs.empty?

      now = Time.current
      inserted = ActiveStorage::Blob.insert_all!( # rubocop:disable Rails/SkipsModelValidations
        new_blobs.map { |blob| blob.merge(created_at: now) },
        returning: %w[id key]
      )
      blob_ids.merge(inserted.rows.to_h { |id, key| [key, id] })
    end

    def insert_attachments(source, entries, blob_ids)
      now = Time.current
      rows = entries.map do |entry|
        { name: source.name, record_type: source.klass.polymorphic_name, record_id: entry[:record_id],
          blob_id: blob_ids.fetch(entry[:blob][:key]), created_at: now }
      end

      ActiveStorage::Attachment.insert_all!(rows) # rubocop:disable Rails/SkipsModelValidations
    end

    def existing_attachments(source, record_ids)
      ActiveStorage::Attachment
        .includes(:blob)
        .where(name: source.name, record_type: source.klass.polymorphic_name, record_id: record_ids)
        .index_by(&:record_id)
    end

    def replaceable?(attachment, entry)
      attachment.blob.metadata['shrine_import'] && attachment.blob.key != entry[:blob][:key]
    end

    def build_entry(source, record_id, data)
      file = (source.original_derivative && data.dig('derivatives', source.original_derivative)) || data
      key = storage_key(source, record_id, file)
      return if key.nil?

      { record_id:, blob: blob_attributes(source, key, file['metadata'] || {}) }
    rescue *MISSING_ERRORS
      nil
    end

    def storage_key(source, record_id, file)
      return if file['id'].blank?
      return file['id'] unless file['storage'] == 'cache'

      promote_cached(source, record_id, file)
    end

    def blob_attributes(source, key, metadata)
      {
        key:,
        filename: filename_for(source, metadata),
        content_type: metadata['mime_type'].presence || Marcel::MimeType.for(name: metadata['filename']),
        byte_size: metadata['size'] || remote_size(key),
        checksum: checksum_for(key, metadata),
        service_name: service.name.to_s,
        metadata: { identified: true, analyzed: true, shrine_import: true }
      }
    end

    def filename_for(source, metadata)
      filename = metadata['filename'].presence
      return filename if filename && !filename.start_with?('image_processing')

      extension = Rack::Mime::MIME_TYPES.invert[metadata['mime_type']].to_s.delete_prefix('.')
      [source.name, extension].compact_blank.join('.')
    end

    def checksum_for(key, metadata)
      return hex_to_base64(metadata['md5']) if metadata['md5'].present?

      etag = remote_etag(key)
      return hex_to_base64(etag) if etag&.match?(/\A\h{32}\z/)

      service.open(key, checksum: nil, verify: false) { |io| Digest::MD5.file(io.path).base64digest }
    end

    def remote_etag(key)
      service.bucket.object(key).etag.delete('"') if service.respond_to?(:bucket)
    end

    def remote_size(key)
      return service.bucket.object(key).content_length if service.respond_to?(:bucket)

      File.size(service.path_for(key))
    end

    def promote_cached(source, record_id, file)
      path = cache_root.join(file['id'])
      return unless path.file?

      key = [source.klass.model_name.singular, record_id, source.name, File.basename(file['id'])].join('/')
      upload_cached(key, path) unless dry_run || service.exist?(key)
      key
    end

    def upload_cached(key, path)
      File.open(path, 'rb') { |io| service.upload(key, io, checksum: Digest::MD5.file(path).base64digest) }
    end

    def hex_to_base64(hex) = [[hex].pack('H*')].pack('m0')

    def parse(raw_data) = raw_data.is_a?(String) ? JSON.parse(raw_data) : raw_data
  end
end
