json.extract! competitor, :id, :event_id
json.profile competitor.user_profile, :id, :name
if competitor.user_profile.country
  json.country competitor.user_profile.country, :name, :code
else
  json.set! :country, name: '', code: ''
end
json.section competitor.section, :id if competitor.section
json.wingsuit competitor.wingsuit, :id, :name
