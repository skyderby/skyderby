namespace :attachments do
  desc 'Import Shrine attachments into Active Storage (DRY_RUN=1 to only report)'
  task import_from_shrine: :environment do
    logger = ActiveSupport::Logger.new($stdout)
    results = Attachment::ShrineImport.call(logger:, dry_run: ENV['DRY_RUN'].present?)

    results.each do |label, result|
      puts "#{label}: #{result}"
      puts "  missing record ids: #{result.missing.first(50).join(', ')}" if result.missing.any?
    end
  end
end

namespace :attachments do
  desc 'Enqueue generation of named variants for images imported from Shrine'
  task process_imported_variants: :environment do
    scope = ActiveStorage::Attachment.joins(:blob)
                                     .where(name: %w[userpic image logo photo sponsor_logo])
                                     .where("active_storage_blobs.metadata LIKE '%shrine_import%'")
                                     .preload(:blob, :record)

    count = 0
    scope.find_each do |attachment|
      attachment.send(:transform_variants_later)
      count += 1
    end
    puts "Enqueued variant processing for #{count} attachments"
  end
end

namespace :attachments do
  desc 'Move blobs to canonical storage keys (DRY_RUN=1, MOVES_LOG=path for the list of old keys)'
  task normalize_keys: :environment do
    logger = ActiveSupport::Logger.new($stdout)
    result = Attachment::KeyNormalization.call(dry_run: ENV['DRY_RUN'].present?, logger:)

    log_path = ENV.fetch('MOVES_LOG', Rails.root.join('tmp/attachment_key_moves.jsonl').to_s)
    File.open(log_path, 'a') { |file| result.moved.each { |move| file.puts(move.to_h.to_json) } } unless ENV['DRY_RUN']

    puts result
    puts "moves logged to #{log_path}" unless ENV['DRY_RUN']
    result.conflicts.first(20).each { |move| puts "conflict: #{move.to_h}" }
    result.failed.first(20).each { |failure| puts "failed: #{failure.inspect}" }
  end

  desc 'Delete old storage keys recorded by attachments:normalize_keys (MOVES_LOG=path, DRY_RUN=1)'
  task delete_moved_keys: :environment do
    service = ActiveStorage::Blob.services.fetch(:r2)
    moves = File.readlines(ENV.fetch('MOVES_LOG'), chomp: true).map { |line| JSON.parse(line) }
    referenced = ActiveStorage::Blob.where(key: moves.pluck('from')).pluck(:key).to_set

    deleted = 0
    moves.each do |move|
      next if referenced.include?(move['from']) || !service.exist?(move['to'])

      service.delete(move['from']) unless ENV['DRY_RUN']
      deleted += 1
    end
    puts "deleted=#{deleted} of #{moves.size}"
  end
end
