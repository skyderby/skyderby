json.key_format! camelize: :lower

json.partial! 'api/v1/competitions/series', series: @series
json.scoreboard_available true
json.scoreboard_path api_v1_performance_competition_series_scoreboard_path(@series)
json.rounds @series.rounds.ordered do |round|
  json.id round.id
  json.discipline round.discipline
  json.number round.number
  json.code round.code
  json.label performance_round_label(round)
  json.unit discipline_unit_label(round.discipline)
  json.completed round.completed
end
