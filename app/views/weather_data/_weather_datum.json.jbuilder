json.extract! weather_datum, :id, :altitude, :wind_speed, :wind_direction
json.actual_on weather_datum.actual_on.strftime('%Y-%m-%d %H:%M')
