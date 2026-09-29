event = scoreboard.event
editable = event.editable?
surprise = event.surprise? && !editable
rounds_by_discipline = scoreboard.rounds_by_discipline
rounds = rounds_by_discipline.values.flatten
time_machine = scoreboard.time_machine?
completed_rounds = scoreboard.completed_rounds
any_completed = rounds.any?(&:completed)
show_discipline_points = scoreboard.show_discipline_points?
flags = {
  editable:,
  time_machine:,
  any_completed:,
  show_discipline_points:,
  show_totals: time_machine ? completed_rounds.any? : any_completed,
  show_rank_changes: any_completed && completed_rounds.length > 1 && (!event.finished? || time_machine)
}

json.board board
json.task local_assigns[:task]
json.surprise surprise
json.editable editable
json.apply_penalty_to_score event.apply_penalty_to_score
json.wind_cancellation do
  json.available event.wind_cancellation
  json.applied scoreboard.wind_cancellation
end
json.until_round scoreboard.until_round
json.time_machine time_machine
json.timeline scoreboard.timeline_rounds do |round|
  json.position scoreboard.timeline_position(round)
  json.round_id round.id
  json.label performance_round_label(round)
end
json.rounds rounds do |round|
  json.id round.id
  json.discipline round.discipline
  json.number round.number
  json.label performance_round_label(round)
  json.completed round.completed
  json.timeline_position scoreboard.timeline_position(round)
end
json.disciplines rounds_by_discipline do |discipline, discipline_rounds|
  json.discipline discipline
  json.label discipline_label(discipline)
  json.unit discipline_unit_label(discipline)
  json.round_ids discipline_rounds.map(&:id)
end
json.show_discipline_points show_discipline_points
json.show_rank_changes flags[:show_rank_changes]

groups = surprise ? [] : groups.to_a
preload_competitors(groups.flat_map { |_category, standings| standings.competitors.to_a }, :event)

json.groups groups do |category, standings|
  if category
    json.category do
      json.id category.id
      json.name category.name
    end
  else
    json.category nil
  end

  rows = standings.rows
  podium_enabled = rows.size >= 3
  json.rows rows do |row|
    json.partial!('api/v1/performance_competitions/standings_row',
                  row:, standings:, scoreboard:, rounds_by_discipline:, flags:, podium_enabled:)
  end
end
