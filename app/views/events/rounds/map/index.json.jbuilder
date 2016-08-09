# #competitors is a hash, where competitor.id is key and
# competitor's track data value
json.array! @round_map.competitors do |competitor|
  json.extract! competitor.last, :path_coordinates, :start_point, :end_point, :color
end
