json.extract! competitor,
              :id,
              :event_id,
              :section_id,
              :wingsuit_id,
              :user_profile_id

json.profile do
  json.extract! competitor.user_profile, :name
  json.set! :url, user_profile_path(competitor.user_profile)
end
if competitor.user_profile.country
  json.country competitor.user_profile.country, :name, :code
else
  json.set! :country, name: '', code: ''
end
json.wingsuit competitor.wingsuit, :name
