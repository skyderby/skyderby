json.points @track_data.points
json.wind_cancellation @track_data.weather_data.any?
json.zerowind_points @track_data.zerowind_points
json.weather_data @track_data.weather_data
json.can_manage policy(@track).edit?
json.default_weather_date @track.recorded_at.beginning_of_hour.strftime('%Y-%m-%d %H:%M')
