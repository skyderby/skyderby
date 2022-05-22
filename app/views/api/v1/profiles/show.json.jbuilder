json.extract! @profile, :id, :name
json.photo do |json|
  json.original @profile.userpic_url
  json.medium @profile.userpic_url(:medium)
  json.thumb @profile.userpic_url(:thumb)
end

json.personal_scores do |json|
  json.array! @profile.personal_top_scores.wind_cancellation(false) do |score|
    json.partial! score.virtual_competition
    json.overall_rank score.rank
    json.overall_result format_result(score.result, score.virtual_competition)
  end
end
