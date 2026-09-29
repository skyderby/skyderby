competition = ranking.competition

json.competition do
  json.extract! competition, :id, :name, :discipline, :discipline_parameter
  json.unit competition_unit(competition)
end

json.rank ranking.rank
json.total ranking.total
json.rank_delta ranking.rank_delta
json.podium ranking.rank <= 3 && ranking.total > 10
json.fill ranking.total.positive? ? (ranking.total - ranking.rank + 1).to_f / ranking.total : 0
json.result ranking.result
json.formatted_result format_result(ranking.result, competition).to_s
json.result_ahead ranking.result_ahead
json.formatted_result_ahead ranking.result_ahead && format_result(ranking.result_ahead, competition).to_s
json.result_behind ranking.result_behind
json.formatted_result_behind ranking.result_behind && format_result(ranking.result_behind, competition).to_s
