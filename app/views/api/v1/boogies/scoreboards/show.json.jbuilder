json.key_format! camelize: :lower

event = @event
scoreboard = @scoreboard
editable = event.editable?
surprise = event.surprise? && !editable
available = event.number_of_results_for_total.present?
rounds = scoreboard.rounds.to_a
groups =
  if surprise || !available
    []
  else
    scoreboard.categories.map { |category, standings| [category, standings, standings.rows] }
  end
preload_competitors(groups.flat_map { |_category, _standings, rows| rows.map(&:competitor) })

json.board 'main'
json.surprise surprise
json.editable editable
json.number_of_results_for_total event.number_of_results_for_total
json.unit t('units.m')
json.rounds rounds do |round|
  json.id round.id
  json.discipline round.discipline
  json.number round.number
  json.label performance_round_label(round)
  json.completed round.completed
end
json.groups groups do |category, standings, rows|
  best = standings.best_result

  json.category do
    json.id category.id
    json.name category.name
  end
  json.best_result_id best&.id
  json.rows rows do |row|
    counting_ids = row.best_results.map(&:id)
    total = row.total_points.to_f.round(1)

    json.rank row.rank
    json.qualified row.qualified?
    json.competitor_id row.competitor.id
    json.competitor { json.partial! 'api/v1/competitions/competitor', competitor: row.competitor }
    json.total_points total
    json.formatted_total_points total.positive? ? format('%d', total) : nil
    json.average_result row.average_result.to_f.round(1)
    json.counting_result_ids counting_ids
    results = row.results.sort_by { |result| result.round.number }
    json.results results do |result|
      json.id result.id
      json.round_id result.round_id
      json.track_id result.track_id
      json.result api_float(result.result)
      json.scored_result api_float(result.scored_result)
      json.formatted_scored_result format('%d', result.scored_result.to_f)
      json.penalized result.penalized?
      json.penalty_size result.penalized? ? result.penalty_size.to_i : 0
      json.penalty_reason result.penalized? ? result.penalty_reason : nil
      json.best best == result
      json.counting counting_ids.include?(result.id)
      json.created_at result.created_at&.utc&.iso8601
    end
  end
end
