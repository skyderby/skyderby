json.id competitor.id
json.name competitor.name
json.assigned_number competitor.try(:assigned_number).presence
json.country_code competitor.country_code
json.country_name competitor.country_name
json.photo_url stored_file_url(competitor.photo_url(:medium))
json.profile { json.partial! 'api/v1/virtual_competitions/profile', profile: competitor.profile }
if (suit = competitor.try(:suit))
  json.suit { json.partial! 'api/v1/virtual_competitions/suit', suit: }
else
  json.suit nil
end
json.profile_owned_by_event competitor_profile_owned_by_event?(competitor)
json.country_id competitor.profile&.country_id
