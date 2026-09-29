json.key_format! camelize: :lower

result = @result
competitor = preload_competitors([result.competitor], :event).first
completed_rounds = result.round.completed ? [result.round] : []

json.partial!('api/v1/speed_skydiving_competitions/result', result:, completed_rounds:)
json.competitor_id competitor.id
json.competitor { json.partial! 'api/v1/competitions/competitor', competitor: }
json.category do
  json.id competitor.category.id
  json.name competitor.category.name
end
json.unit t('units.kmh')
json.exit_altitude api_float(result.exit_altitude, 1)
json.window_start_time result.window_start_time&.utc&.iso8601(3)
json.window_start_altitude api_float(result.window_start_altitude, 1)
json.window_end_time result.window_end_time&.utc&.iso8601(3)
json.window_end_altitude api_float(result.window_end_altitude, 1)
json.point_series_path result.track_id && api_v1_track_point_series_path(result.track_id)
