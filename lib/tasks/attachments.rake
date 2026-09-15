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
                                     .includes(:blob, :record)

    count = 0
    scope.find_each do |attachment|
      attachment.send(:transform_variants_later)
      count += 1
    end
    puts "Enqueued variant processing for #{count} attachments"
  end
end
