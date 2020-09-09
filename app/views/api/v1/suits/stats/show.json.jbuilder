json.key_format! camelize: :lower

json.array! @stats do |record|
  json.extract! record, :id, :profiles, :base_tracks, :skydive_tracks
end
