json.extract! competitor, :id, :event_id
json.profile do
  json.extract! competitor.user_profile, :id, :name
  json.set! :url, user_profile_path(competitor.user_profile)
end
if competitor.user_profile.country
  json.country competitor.user_profile.country, :name, :code
else
  json.set! :country, name: '', code: ''
end
json.section competitor.section, :id if competitor.section
json.wingsuit competitor.wingsuit, :id, :name
