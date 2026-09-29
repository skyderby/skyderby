json.rank row.rank
if category.show_rank_changes?
  previous_rank = category.standings.previous_rank(row.profile_id)
  json.rank_change do
    json.partial! 'api/v1/virtual_competitions/rank_change', change: previous_rank && (previous_rank - row.rank)
  end
else
  json.rank_change nil
end
json.profile { json.partial! 'api/v1/virtual_competitions/profile', profile: row.profile }
json.total_points row.total_points
json.disciplines do
  category.competitions.each do |discipline, competition|
    score = row.score(discipline)
    gap = row.gap_to_best(discipline)

    json.set! discipline do
      json.result score.result
      json.result_formatted format_result(score.result, competition).to_s
      json.points row.points_in_disciplines[discipline]
      json.best row.best_in?(discipline)
      json.gap gap
      json.gap_formatted gap && format_gap(gap, competition)
      json.track_id score.track_id
      json.recorded_at score.recorded_at&.utc&.iso8601
    end
  end
end
