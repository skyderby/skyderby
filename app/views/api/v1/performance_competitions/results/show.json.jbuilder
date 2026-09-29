json.key_format! camelize: :lower

result = @result
event = @event
round = result.round
competitor = preload_competitors([result.competitor], :event, suit: :manufacturer).first
reference_point = result.reference_point
discipline = round.discipline

json.id result.id
json.round do
  json.id round.id
  json.discipline discipline
  json.number round.number
  json.label performance_round_label(round)
  json.unit discipline_unit_label(discipline)
  json.completed round.completed
end
json.competitor_id competitor.id
json.competitor { json.partial! 'api/v1/competitions/competitor', competitor: }
json.category do
  json.id competitor.category.id
  json.name competitor.category.name
end
json.track_id result.track_id
json.result api_float(result.result)
json.formatted_result format_discipline_value(discipline, result.result)
json.result_net api_float(result.result_net)
json.formatted_result_net format_discipline_value(discipline, result.result_net)
json.penalized result.penalized?
json.penalty_size result.penalized? ? result.penalty_size.to_i : 0
json.penalty_reason result.penalized? ? result.penalty_reason : nil
json.validated result.validated?
json.exited_at result.exited_at&.utc&.iso8601(3)
json.exit_altitude api_float(result.exit_altitude, 1)
json.pull_altitude result.pull_altitude
json.heading_within_window result.heading_within_window
json.window do
  json.from event.range_from
  json.to event.range_to
end
json.designated_lane_start event.designated_lane_start
json.lane_validation_stops_at event.lane_validation_stops_at
if reference_point
  json.reference_point do
    json.id reference_point.id
    json.name reference_point.name
    json.latitude api_float(reference_point.latitude)
    json.longitude api_float(reference_point.longitude)
  end
else
  json.reference_point nil
end
json.point_series_path result.track_id && api_v1_track_point_series_path(result.track_id)
json.weather_data_path result.track_id && api_v1_track_weather_data_path(result.track_id)
json.created_at result.created_at&.utc&.iso8601
