namespace :track_results do
  desc 'Recompute Track::Result rows (best + journal disciplines) for tracks from the last 365 days'
  task backfill: :environment do
    scope = Track.where(recorded_at: 365.days.ago..)
    total = scope.count
    done = 0

    scope.in_batches(of: 500) do |batch|
      batch.pluck(:id).each { |id| ResultsJob.perform_later(id) }
      done += batch.size
      puts "Enqueued #{done}/#{total}"
    end

    puts 'Done'
  end
end
