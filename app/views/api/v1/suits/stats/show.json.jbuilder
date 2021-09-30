json.key_format! camelize: :lower

json.array! @stats do |record|
  json.suit_id record.id
  json.extract! record, :profiles, :base_tracks, :skydive_tracks
end
