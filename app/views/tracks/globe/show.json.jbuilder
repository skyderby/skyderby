json.name @globe_data.pilot_name
json.track_direction @globe_data.avg_heading
json.start_time @globe_data.start_time
json.stop_time @globe_data.stop_time
json.nearby_places @globe_data.nearby_places, :name, :latitude, :longitude
json.points @globe_data.points do |point|
  json.extract! point, :abs_altitude, :latitude, :longitude, :h_speed, :v_speed, :glide_ratio
  json.gps_time point[:gps_time].iso8601(3)
end
