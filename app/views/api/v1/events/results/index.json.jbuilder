json.array! @results do |result|
  json.extract! result, :id, :result, :penalized, :penalty_size, :penalty_reason, :competitor_id, :round_id
  json.competitor_name result.competitor.name
  json.round_name "#{result.round.discipline.capitalize}-#{result.round.number}"
end
