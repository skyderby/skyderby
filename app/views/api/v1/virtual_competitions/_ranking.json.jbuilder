competition = ranking.competition
scores = ranking.scores
focused_score = focused_profile_id && ranking.all_scores.find { |score| score.profile_id == focused_profile_id }
focused_on_page = focused_score && scores.any? { |score| score.profile_id == focused_profile_id }

json.competition_id competition.id
json.filters do
  json.jump_kind ranking.jump_kind
  json.gender ranking.gender
  json.highlight ranking.highlight_profile_id
  json.partial! 'api/v1/virtual_competitions/filter_options',
                jump_kinds: ranking.jump_kind_options, genders: ranking.gender_options
end
json.unit competition_unit(competition)
json.results_sort_order competition.results_sort_order
json.display_highest_speed competition.display_highest_speed.present?
json.display_highest_gr competition.display_highest_gr.present?
json.worldwide competition.worldwide?
json.show_rank_changes ranking.show_rank_changes?
json.pagination do
  json.page scores.current_page
  json.per_page scores.limit_value
  json.total_pages scores.total_pages
  json.total_count scores.total_count
end

score_partial = 'api/v1/virtual_competitions/score'
podium = ranking.all_scores.size > 2 ? ranking.all_scores.take(3) : []
json.podium(podium, partial: score_partial, as: :score, ranking:)
json.scores(scores, partial: score_partial, as: :score, ranking:)
if focused_score && !focused_on_page
  json.focused { json.partial! score_partial, score: focused_score, ranking: }
else
  json.focused nil
end
