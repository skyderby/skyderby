module Attachment
  class KeyNormalization
    Move = Data.define(:blob_id, :from, :to)

    Result = Struct.new(:moved, :unchanged, :conflicts, :failed, keyword_init: true) do
      def self.empty = new(moved: [], unchanged: 0, conflicts: [], failed: [])

      def to_s = "moved=#{moved.size} unchanged=#{unchanged} conflicts=#{conflicts.size} failed=#{failed.size}"
    end

    BATCH_SIZE = 1000

    def self.call(...) = new(...).call

    def initialize(service_name: 'r2', dry_run: false, logger: nil)
      @service_name = service_name.to_s
      @dry_run = dry_run
      @logger = logger
    end

    def call
      Result.empty.tap do |result|
        normalize_originals(result)
        normalize_variants(result)
        normalize_profile_originals(result)
      end
    end

    private

    attr_reader :service_name, :dry_run, :logger

    def service = @service ||= ActiveStorage::Blob.services.fetch(service_name.to_sym)

    def normalize_originals(result)
      scope = ActiveStorage::Attachment.where.not(record_type: 'ActiveStorage::VariantRecord')
                                       .joins(:blob)
                                       .where(active_storage_blobs: { service_name: })
                                       .preload(:blob)

      scope.find_each(batch_size: BATCH_SIZE) do |attachment|
        target = canonical_key(attachment, attachment.blob)
        next result.unchanged += 1 if attachment.blob.key == target

        move_blob(attachment.blob, target, result)
      end
      logger&.info("originals: #{result}")
    end

    def normalize_variants(result)
      variants = ActiveStorage::VariantRecord.preload(image_attachment: :blob, blob: :attachments)
      variants.find_each(batch_size: BATCH_SIZE) do |variant|
        image = variant.image_attachment&.blob
        original = variant.blob.attachments.first
        next if image.nil? || original.nil? || image.service_name != service_name

        original_key = canonical_key(original, variant.blob)
        target = variant_key(original_key, variant.variation_digest, image.filename.extension_with_delimiter)
        next result.unchanged += 1 if image.key == target

        move_blob(image, target, result)
      end
      logger&.info("variants: #{result}")
    end

    def normalize_profile_originals(result)
      rows = ActiveRecord::Base.connection.select_rows(<<~SQL.squish)
        SELECT id, userpic_data::jsonb->>'id', userpic_data::jsonb->'metadata'->>'mime_type'
        FROM profiles
        WHERE userpic_data IS NOT NULL AND userpic_data::jsonb->>'storage' = 'store'
      SQL

      rows.each do |profile_id, from, mime_type|
        extension = Rack::Mime::MIME_TYPES.invert[mime_type].to_s
        to = "profile/#{profile_id}/userpic/original#{extension}"
        next result.unchanged += 1 if from == to

        move_object(from, to, result)
      end
      logger&.info("profile originals: #{result}")
    end

    def canonical_key(attachment, blob)
      prefix = "#{attachment.record_type.constantize.model_name.singular}/#{attachment.record_id}/#{attachment.name}/"
      blob.key.start_with?(prefix) ? blob.key : "#{prefix}#{blob.filename.sanitized}"
    end

    def variant_key(original_key, variation_digest, extension)
      original = original_key.delete_suffix(File.extname(original_key))
      "#{original}.variants/#{Base64.decode64(variation_digest).unpack1('H*')}#{extension}"
    end

    def move_blob(blob, to, result)
      if ActiveStorage::Blob.where(key: to).where.not(id: blob.id).exists?
        result.conflicts << Move.new(blob.id, blob.key, to)
        return
      end

      from = blob.key
      copy(from, to) unless dry_run
      blob.update_column(:key, to) unless dry_run # rubocop:disable Rails/SkipsModelValidations
      result.moved << Move.new(blob.id, from, to)
    rescue StandardError => e
      result.failed << [blob.id, from, e.class.name]
    end

    def move_object(from, to, result)
      copy(from, to) unless dry_run
      result.moved << Move.new(nil, from, to)
    rescue StandardError => e
      result.failed << [nil, from, e.class.name]
    end

    def copy(from, to)
      return if service.exist?(to)

      if service.respond_to?(:bucket)
        service.bucket.object(to).copy_from(bucket: service.bucket.name, key: from)
      else
        service.upload(to, StringIO.new(service.download(from)))
      end
    end
  end
end
