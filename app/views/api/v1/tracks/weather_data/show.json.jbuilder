json.key_format! camelize: :lower

json.array! @weather_data do |item|
  json.action_on item.actual_on.iso8601(3)
  json.altitude item.altitude.to_f
  json.wind_speed item.wind_speed.to_f
  json.wind_direction item.wind_direction.to_f
end
