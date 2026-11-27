json.altitude @points do |point|
  json.array! [point[:fl_time], point[:altitude]]
end

json.h_speed @points do |point|
  json.array! [point[:fl_time], Track::Points.to_kmh(point[:h_speed])]
end

json.v_speed @points do |point|
  json.array! [point[:fl_time], Track::Points.to_kmh(point[:v_speed])]
end
