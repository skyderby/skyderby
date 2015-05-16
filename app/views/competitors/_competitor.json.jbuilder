json.extract! competitor, :id, :event_id
json.profile competitor.user_profile, :id, :name
json.section competitor.section, :id if competitor.section
json.wingsuit competitor.wingsuit, :id, :name
