json.key_format! camelize: :lower

json.array! @points do |point|
  json.extract! point,
                :fl_time,
                :abs_altitude,
                :altitude,
                :h_speed,
                :v_speed,
                :glide_ratio

  json.latitude point[:latitude].to_f
  json.longitude point[:longitude].to_f
  json.gps_time point[:gps_time].iso8601(3)
end
