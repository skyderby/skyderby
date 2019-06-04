json.array! @points do |point|
  json.extract! point,
                :gps_time,
                :fl_time,
                :abs_altitude,
                :altitude,
                :latitude,
                :longitude,
                :h_speed,
                :v_speed,
                :glide_ratio
end
