json.path_coordinates @map_data.path_coordinates
json.start_point @map_data.start_point
json.end_point @map_data.end_point
json.after_exit_point @map_data.after_exit_point
json.reference_point @map_data.reference_point
json.designated_lane_start @map_data.designated_lane_start

json.place do
  json.latitude @map_data.event.place.latitude
  json.longitude @map_data.event.place.latitude
end
