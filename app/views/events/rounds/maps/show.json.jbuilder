json.array! @round_map.competitors do |competitor_data|
  json.id competitor_data.id
  json.name competitor_data.name.titleize
  json.path_coordinates competitor_data.path_coordinates
  json.start_point competitor_data.start_point
  json.end_point competitor_data.end_point
  json.color competitor_data.color
end
