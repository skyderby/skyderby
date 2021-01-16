json.finish_line @match_map.finish_line
json.exit_point do |json|
  json.latitude @match_map.place.latitude
  json.longitude @match_map.place.longitude
end
json.competitors @match_map.competitors do |competitor|
  json.extract! competitor, :name, :path, :color
end
