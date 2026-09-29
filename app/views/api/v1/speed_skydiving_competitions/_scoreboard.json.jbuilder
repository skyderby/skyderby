event = scoreboard.event
editable = event.editable?
surprise = event.surprise? && !editable
time_machine = scoreboard.until_round.present?
rounds = scoreboard.rounds.to_a
completed_rounds = scoreboard.completed_rounds.to_a
flags = {
  editable_cells: editable && !event.finished? && !time_machine,
  any_completed: completed_rounds.any?,
  show_rank_changes: board == 'main' && completed_rounds.length > 1 && (!event.finished? || time_machine)
}

json.board board
json.surprise surprise
json.editable editable
json.unit t('units.kmh')
json.until_round scoreboard.until_round
json.time_machine time_machine
json.rounds rounds do |round|
  json.id round.id
  json.number round.number
  json.completed round.completed
end
json.show_rank_changes flags[:show_rank_changes]

groups = surprise ? [] : groups.to_a
preload_competitors(groups.flat_map { |_category, rows| rows.map { |row| row[:competitor] } }, :event)

json.groups groups do |category, rows|
  if category
    json.category do
      json.id category.id
      json.name category.name
    end
  else
    json.category nil
  end

  json.rows rows do |row|
    json.partial!('api/v1/speed_skydiving_competitions/standings_row', row:, flags:, completed_rounds:)
  end
end
