json.key_format! camelize: :lower

series = @series
scoreboard = @scoreboard
editable = series.editable?
surprise = series.surprise? && !editable
rounds_by_discipline = scoreboard.rounds_by_discipline
categories = surprise ? [] : scoreboard.categories
preload_competitors(categories.flat_map { |category| category.standings.map(&:competitor) })

json.board 'main'
json.surprise surprise
json.editable editable
json.display_raw_results scoreboard.settings.display_raw_results
json.rounds rounds_by_discipline.values.flatten do |round|
  json.id round.id
  json.discipline round.discipline
  json.number round.number
  json.code round.code
  json.label performance_round_label(round)
  json.completed round.completed
end
json.disciplines rounds_by_discipline do |discipline, discipline_rounds|
  json.discipline discipline
  json.label discipline_label(discipline)
  json.unit discipline_unit_label(discipline)
  json.round_ids discipline_rounds.map(&:id)
end
json.groups categories do |category|
  json.category do
    json.id nil
    json.name category.name
  end
  json.rows category.standings do |row|
    competitor = row.competitor
    competition = competitor.event

    json.rank row.rank
    json.competitor_id competitor.id
    json.competitor { json.partial! 'api/v1/competitions/competitor', competitor: }
    json.competition do
      json.id competition.id
      json.name competition.name
      json.place_name competition.place&.name
    end
    json.total_points row.total_points.to_f
    json.formatted_total_points format_points(row.total_points)
    json.discipline_points rounds_by_discipline.keys do |discipline|
      points = row.points_in_disciplines[discipline]
      json.discipline discipline
      json.points points&.to_f&.round(1)
      json.formatted_points format_points(points)
    end
    cells = rounds_by_discipline.values.flatten.map { |round| [round, row.result_in_round(round)] }.select(&:last)
    json.results cells do |round, result|
      record = result.record

      json.id record.id
      json.round_id round.id
      json.competition_round_id record.round_id
      json.event_id record.round.event_id
      json.track_id record.track_id
      json.status round.completed ? 'final' : 'provisional'
      json.result api_float(result.result)
      json.formatted_result result.formatted_result.presence
      json.points result.points&.to_f&.round(1)
      json.formatted_points result.formatted_points.presence
      json.best result.best_result
      json.penalized result.penalized || false
      json.penalty_size result.penalized ? result.penalty_size.to_i : 0
      json.penalty_reason result.penalized ? result.penalty_reason : nil
    end
  end
end
