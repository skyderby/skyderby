json.extract! competitor, :id
json.profile competitor.user_profile, :id, :name
json.section competitor.section, :id
json.wingsuit competitor.wingsuit, :id, :name
