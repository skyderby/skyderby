json.extract! result, :id, :competitor_id, :round_id, :track_id, :exit_time, :result, :penalized, :penalty_size, :penalty_reason
json.competitor_name result.competitor.name
json.round_name "#{result.round.discipline.capitalize}-#{result.round.number}"
if result.reference_point
  json.reference_point_name result.reference_point.name
  json.reference_point_coordinates "#{result.reference_point.latitude}, #{result.reference_point.longitude}"
else
  json.reference_point_name nil
  json.reference_point_coordinates nil
end
