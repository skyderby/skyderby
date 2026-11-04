json.key_format! camelize: :lower

json.kind @logbook.kind
json.years @years
json.year @year
json.tracks(@year ? @logbook.import_candidates(@year) : []) do |track|
  json.id track.id
  json.recorded_at track.recorded_at&.iso8601
  json.place_name track.place_name || track.location
  json.suit_name track.suit_name || track.missing_suit_name
end
