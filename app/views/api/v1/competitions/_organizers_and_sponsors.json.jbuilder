json.organizers organizable.organizers do |organizer|
  json.id organizer.id
  json.user_id organizer.user_id
  json.profile_id organizer.user&.profile&.id
  json.name organizer.name
end
json.sponsors organizable.sponsors do |sponsor|
  json.id sponsor.id
  json.name sponsor.name
  json.website sponsor.website
  json.logo_url stored_file_url(sponsor.logo_url(:medium))
end
