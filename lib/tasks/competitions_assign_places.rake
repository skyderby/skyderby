namespace :competitions do
  desc 'Backfill competitor places for past Performance and Speed Skydiving competitions'
  task assign_places: [:environment] do
    perf = PerformanceCompetition.where(id: PerformanceCompetition::Round.completed.select(:event_id))
    speed = SpeedSkydivingCompetition.where(id: SpeedSkydivingCompetition::Round.completed.select(:event_id))

    puts "Performance competitions: #{perf.count}, Speed Skydiving competitions: #{speed.count}"

    [perf, speed].each do |competitions|
      competitions.find_each do |competition|
        competition.assign_competitor_places!
        print "\rProcessed #{competition.class.name} ##{competition.id}"
      rescue StandardError => e
        puts "\nFailed to process #{competition.class.name} ##{competition.id}: #{e.message}"
      end
    end

    puts "\nDone."
  end
end
