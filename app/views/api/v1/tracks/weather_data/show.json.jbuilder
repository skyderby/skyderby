json.key_format! camelize: :lower

json.array! @weather_data do |item|
  json.extract! item, :actual_on, :altitude, :wind_speed, :wind_direction
end
