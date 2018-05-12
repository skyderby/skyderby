json.competitors do
  json.array! @round_map.competitors do |competitor_data|
    next if competitor_data.empty?

    json.id competitor_data.id
    json.name competitor_data.name.titleize
    json.path_coordinates competitor_data.path_coordinates
    json.start_point competitor_data.start_point
    json.end_point competitor_data.end_point
    json.after_exit_point competitor_data.after_exit_point
    json.color competitor_data.color
  end
end

json.place do
  json.latitude @round_map.event.place.latitude
  json.longitude @round_map.event.place.latitude
end
