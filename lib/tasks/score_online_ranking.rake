namespace :online_rankings do
  desc "Score existing tracks against a virtual competition. Usage: rake online_rankings:score[42] or rake online_rankings:score[42,2026]"
  task :score, [:competition_id, :year] => :environment do |_t, args|
    competition = VirtualCompetition.find(args[:competition_id])
    year = args[:year]&.to_i

    puts "Competition: #{competition.name}"
    puts "Discipline: #{competition.discipline}, Jumps: #{competition.jumps_kind}, Suits: #{competition.suits_kind}"
    puts "Place: #{competition.place_name || 'Worldwide'}"
    puts "Period: #{competition.period_from} - #{competition.period_to || 'ongoing'}"

    tracks = Track.where(visibility: :public_track)
                  .where.not(suit_id: nil)
                  .where.not(profile_id: nil)
                  .where(disqualified_from_online_competitions: false)

    tracks = tracks.where(kind: competition.jumps_kind) if competition.jumps_kind
    tracks = tracks.where(place_id: competition.place_id) if competition.place_id

    if year
      tracks = tracks.where(recorded_at: Date.new(year)..Date.new(year, 12, 31))
      puts "Filtering tracks from year: #{year}"
    elsif competition.period_from && competition.period_to
      tracks = tracks.where(recorded_at: competition.period_from..competition.period_to)
    end

    if competition.suits_kind
      suit_ids = Suit.where(kind: competition.suits_kind).select(:id)
      tracks = tracks.where(suit_id: suit_ids)
    end

    already_scored = competition.results.select(:track_id).distinct
    tracks = tracks.where.not(id: already_scored)

    count = tracks.count
    puts "Found #{count} tracks to score"

    tracks.find_each.with_index do |track, index|
      OnlineCompetitionsService.new(track, competition).score
      print "\rScored #{index + 1}/#{count}"
    rescue => e
      puts "\nError scoring track ##{track.id}: #{e.message}"
    end

    puts "\nDone! Total results: #{competition.results.count}"
  end
end
