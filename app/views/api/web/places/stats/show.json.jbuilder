json.last_track_recorded_at @place.last_track_recorded_at&.iso8601

json.popular_times do
  @place.popular_times.each do |item|
    json.set! item[:month] do
      json.extract! item, :track_count, :people_count
    end
  end
end
