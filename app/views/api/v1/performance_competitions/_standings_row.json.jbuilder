competitor = row.competitor
total_points = row.total_points.to_f

json.rank row.rank
if flags[:show_rank_changes]
  previous_rank = standings.previous_rank(competitor)
  json.previous_rank previous_rank
  json.rank_change do
    json.partial! 'api/v1/virtual_competitions/rank_change', change: previous_rank ? previous_rank - row.rank : 0
  end
else
  json.previous_rank nil
  json.rank_change nil
end
json.on_podium podium_enabled && flags[:any_completed] && total_points.positive? && row.rank <= 3
json.competitor_id competitor.id
json.competitor { json.partial! 'api/v1/competitions/competitor', competitor: }
json.total_points flags[:show_totals] ? total_points : nil
json.formatted_total_points flags[:show_totals] ? format_points(total_points) : nil

if flags[:show_discipline_points]
  json.discipline_points rounds_by_discipline do |discipline, discipline_rounds|
    points = row.points_in_disciplines[discipline]
    visible = flags[:time_machine] ? points.present? : discipline_rounds.any?(&:completed)
    json.discipline discipline
    json.points visible ? points.to_f.round(1) : nil
    json.formatted_points visible ? format_points(points) : nil
  end
else
  json.discipline_points []
end

cells = rounds_by_discipline.values.flatten.filter_map do |round|
  result = row.result_in_round(round)
  next unless result

  if flags[:time_machine]
    position = scoreboard.timeline_position(round)
    [result, 'final'] if position && position <= scoreboard.until_round
  elsif round.completed
    [result, 'final']
  elsif flags[:editable]
    [result, 'provisional']
  elsif result.validated?
    [result, 'validated']
  end
end

json.results cells do |result, status|
  scored = status == 'final' && result.valid?
  discipline = result.round.discipline
  gap = result.gap_to_best if result.result.positive?

  json.id result.id
  json.round_id result.round_id
  json.track_id result.track_id
  json.status status
  json.valid result.valid?
  json.result api_float(result.result)
  json.formatted_result result.formatted_result.presence
  json.points(scored ? result.points.to_f.round(1) : nil)
  json.formatted_points(scored ? format_points(result.points) : nil)
  json.best status == 'final' && result.best_result?
  json.gap_to_best api_float(gap)
  json.formatted_gap_to_best format_discipline_value(discipline, gap)
  json.penalized result.penalized?
  json.penalty_size result.penalty_size.to_i
  json.penalty_reason result.penalized? ? result.penalty_reason : nil
  json.validated result.validated?
  json.created_at result.created_at&.utc&.iso8601
end
