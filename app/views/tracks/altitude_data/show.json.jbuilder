json.array! @points do |point|
  json.fl_time point[:fl_time].to_f
  json.altitude point[:altitude].to_f
  json.h_speed Track::Points.to_kmh(point[:h_speed])
  json.v_speed Track::Points.to_kmh(point[:v_speed])
end
