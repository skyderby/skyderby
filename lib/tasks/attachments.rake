namespace :attachments do
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
