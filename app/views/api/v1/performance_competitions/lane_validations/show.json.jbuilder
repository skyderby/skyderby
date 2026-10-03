json.key_format! camelize: :lower

event = @event
round = @round

json.round do
  json.id round.id
  json.discipline round.discipline
  json.number round.number
  json.label performance_round_label(round)
  json.unit discipline_unit_label(round.discipline)
  json.completed round.completed
end

json.rounds @rounds do |item|
  json.id item.id
  json.discipline item.discipline
  json.number item.number
  json.label performance_round_label(item)
  json.completed item.completed
end

json.editable @editable
json.judgeable @editable && !round.completed
json.available @available

json.event do
  json.id event.id
  json.range_from event.range_from
  json.range_to event.range_to
  json.designated_lane_start event.designated_lane_start
  json.lane_validation_stops_at event.lane_validation_stops_at
  if event.place
    json.place do
      json.latitude api_float(event.place.latitude)
      json.longitude api_float(event.place.longitude)
    end
  else
    json.place nil
  end
end

json.reference_points event.reference_points.sort_by(&:name) do |reference_point|
  json.id reference_point.id
  json.name reference_point.name
  json.latitude api_float(reference_point.latitude)
  json.longitude api_float(reference_point.longitude)
end

json.groups @grouped_jumps.each_with_index.to_a do |(jumps, index)|
  json.number index + 1
  json.jumps jumps do |jump|
    competitor = jump.competitor
    track = jump.track

    json.result_id jump.id
    json.competitor do
      json.id competitor.id
      json.name competitor.name
      json.assigned_number competitor.assigned_number.presence
    end
    json.track_id jump.track_id
    json.ff_start track&.ff_start
    json.ff_end track&.ff_end
    json.exited_at jump.exited_at&.utc&.iso8601(3)
    json.exit_altitude jump.exit_altitude&.to_i
    json.heading_within_window jump.heading_within_window
    json.result api_float(jump.result)
    json.formatted_result format_discipline_value(round.discipline, jump.result)
    json.validated jump.validated?
    json.penalized jump.penalized?
    json.penalty_size jump.penalized? ? jump.penalty_size.to_i : 0
    json.penalty_reason jump.penalized? ? jump.penalty_reason : nil
    json.reference_point_id jump.reference_point&.id
    json.points_path jump.track_id && api_v1_track_points_path(jump.track_id)
    json.point_series_path jump.track_id && api_v1_track_point_series_path(jump.track_id)
  end
end
