json.extract! event_organizer, :id, :event_id
json.user_profile_id event_organizer.user_profile.id
json.user_profile_name event_organizer.user_profile.name
