json.finish_line @match_map.finish_line
json.exit_point do |json|
  json.latitude @match_map.exit_lat
  json.longitude @match_map.exit_lon
end
json.competitors @match_map.competitors
