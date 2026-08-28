namespace :exit_profiles do
  desc 'Compute Track::ExitProfile rows for BASE tracks with a known suit and pilot'
  task backfill: :environment do
    scope = Track.base.where.not(profile_id: nil).where.not(suit_id: nil)
    total = scope.count
    done = 0

    scope.in_batches(of: 500) do |batch|
      batch.pluck(:id).each { |id| ExitProfileJob.perform_later(id) }
      done += batch.size
      puts "Enqueued #{done}/#{total}"
    end

    puts 'Done'
  end
end
