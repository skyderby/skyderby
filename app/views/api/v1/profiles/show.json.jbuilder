json.extract! @profile, :id, :name
json.photo do |json|
  json.original @profile.userpic.url
  json.medium @profile.userpic.url(:medium)
  json.thumb @profile.userpic.url(:thumb)
end

json.personal_scores do |json|
  json.array! @profile.personal_top_scores do |score|
    json.partial! score.virtual_competition
    json.overall_result format_result(score.result, score.virtual_competition)
  end
end
