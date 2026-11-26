json.array! @points do |point|
  json.extract! point,
                :fl_time,
                :abs_altitude,
                :altitude,
                :latitude,
                :longitude,
                :glide_ratio
  json.h_speed api_speed(point.h_speed)
  json.v_speed api_speed(point.v_speed)
  json.sep50 0.5127 * ((2 * point[:horizontal_accuracy].to_i) + point[:vertical_accuracy].to_i)
  json.gps_time point[:gps_time].iso8601(3)
end
