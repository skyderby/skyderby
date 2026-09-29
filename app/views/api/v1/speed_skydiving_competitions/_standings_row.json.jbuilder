competitor = row[:competitor]
total = row[:total].to_f
cells = flags[:editable_cells] ? row[:all_results] : row[:accountable_results]
cells = cells.sort_by { |result| result.round.number }

json.rank row[:rank]
if flags[:show_rank_changes]
  previous_rank = row[:previous_rank]
  json.previous_rank previous_rank
  json.rank_change do
    json.partial! 'api/v1/virtual_competitions/rank_change', change: previous_rank ? previous_rank - row[:rank] : 0
  end
else
  json.previous_rank nil
  json.rank_change nil
end
json.on_podium flags[:any_completed] && total.positive? && row[:rank] <= 3
json.competitor_id competitor.id
json.competitor { json.partial! 'api/v1/competitions/competitor', competitor: }
json.total flags[:any_completed] ? total : nil
json.formatted_total flags[:any_completed] ? format_speed(total) : nil
json.average flags[:any_completed] ? row[:average].to_f : nil
json.formatted_average flags[:any_completed] ? format_speed(row[:average]) : nil
json.best_result api_float(row[:best_result], 2)
json.worst_result api_float(row[:worst_result], 2)

json.results cells do |result|
  best = row[:best_result].present? && result.final_result == row[:best_result]

  json.partial!('api/v1/speed_skydiving_competitions/result', result:, completed_rounds:)
  json.best best
  json.worst !best && row[:worst_result].present? && result.final_result == row[:worst_result]
end
