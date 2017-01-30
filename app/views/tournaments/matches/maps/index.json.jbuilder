json.id @match.id

json.competitors @match.tournament_match_competitors do |competitor_result|
  json.id competitor_result.id
  json.name competitor_result.tournament_competitor.name
  json.track_points competitor_result.track_points
end

json.finish_line @tournament.finish_line do |finish_line_point|
  json.latitude finish_line_point.latitude
  json.longitude finish_line_point.longitude
end

json.exit_point do |json|
  json.latitude @tournament.exit_lat
  json.longitude @tournament.exit_lon
end
