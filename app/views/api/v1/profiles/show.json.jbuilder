json.key_format! camelize: :lower

json.extract! @profile, :id, :name, :country_id
json.country_code @profile.country&.code
json.tracks_count do
  json.skydive @track_counts['skydive'].to_i
  json.base @track_counts['base'].to_i
  json.speed_skydiving @track_counts['speed_skydiving'].to_i
end
json.contributor @profile.contributor?
json.photo do |json|
  json.original stored_file_url(@profile.userpic_url)
  json.medium stored_file_url(@profile.userpic_url(:medium))
  json.thumb stored_file_url(@profile.userpic_url(:thumb))
end

json.personal_scores do |json|
  json.array! @profile.personal_top_scores.wind_cancellation(false) do |score|
    json.partial! score.virtual_competition
    json.overall_rank score.rank
    json.overall_result format_result(score.result, score.virtual_competition)
  end
end
