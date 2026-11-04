json.key_format! camelize: :lower

json.round_id @round.id
json.available @available
json.window do
  json.from @event.range_from
  json.to @event.range_to
end
json.groups @groups do |jumps|
  json.array! jumps do |jump|
    json.result_id jump.id
    json.track_id jump.track_id
    json.competitor_name jump.competitor.name
    json.exited_at jump.exited_at&.utc&.iso8601
    json.result jump.result&.round
  end
end
