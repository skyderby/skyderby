json.key_format! camelize: :lower

json.wind_cancellation @zerowind_points.any?

json.points @points do |point|
  json.extract! point,
                :fl_time,
                :abs_altitude,
                :altitude,
                :h_speed,
                :v_speed,
                :full_speed,
                :glide_ratio,
                :vertical_accuracy,
                :speed_accuracy,
                :zerowind_h_speed,
                :zerowind_glide_ratio

  json.latitude point[:latitude].to_f
  json.longitude point[:longitude].to_f
  json.gps_time point[:gps_time].iso8601(3)
end
