json.key_format! camelize: :lower

json.partial! 'api/v1/sync/suit', suit: @suit

json.manufacturer do
  json.extract! @suit.manufacturer, :id, :name, :code
end

json.tracks_count @suit.accessible_tracks.count
json.pilots_count @suit.accessible_profiles.count
json.recent_track_ids @suit.accessible_tracks.order(recorded_at: :desc).limit(10).ids

if (performance = @suit.exit_performance)
  json.exit_performance do
    json.pilots_count performance.pilots_count
    json.jumps_count performance.jumps_count
    json.reliable performance.reliable?
    json.samples performance.samples
  end
else
  json.exit_performance nil
end
