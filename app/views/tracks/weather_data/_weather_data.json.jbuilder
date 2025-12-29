json.key_format! camelize: :lower
json.array! weather_data do |record|
  json.actual_on record.actual_on.iso8601
  json.altitude record.altitude.to_f
  json.wind_speed record.wind_speed.to_f
  json.wind_direction record.wind_direction.to_f
end
