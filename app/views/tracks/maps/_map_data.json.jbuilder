json.key_format! camelize: :lower
json.points map_data.points do |point|
  json.latitude point[:latitude].to_f
  json.longitude point[:longitude].to_f
  json.h_speed point[:h_speed].to_f
end
json.zerowind_points map_data.zerowind_points do |point|
  json.latitude point[:latitude].to_f
  json.longitude point[:longitude].to_f
  json.h_speed point[:h_speed].to_f
end
