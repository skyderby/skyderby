json.extract! competitor,
              :id,
              :event_id,
              :section_id,
              :wingsuit_id,
              :profile_id

json.profile do
  json.extract! competitor.profile, :name
  json.set! :url, profile_path(competitor.profile)
end
if competitor.profile.country
  json.country competitor.profile.country, :name, :code
else
  json.set! :country, name: '', code: ''
end
json.wingsuit competitor.wingsuit, :name
