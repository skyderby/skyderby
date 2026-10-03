json.key_format! camelize: :lower

match = @match

json.id match.id
json.round_id match.round_id
json.position match.position
json.match_type match.match_type
json.start_time match.start_time&.utc&.iso8601(3)
json.slots match.slots do |slot|
  json.partial!('api/v1/tournaments/slots/slot', slot:)
end
