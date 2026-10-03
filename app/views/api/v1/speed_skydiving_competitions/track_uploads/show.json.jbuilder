json.key_format! camelize: :lower

json.results @results do |result|
  json.id result.id
  json.competitor_id result.competitor_id
  json.round_id result.round_id
  json.track_id result.track_id
end
