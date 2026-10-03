json.key_format! camelize: :lower

json.id @organizer.id
json.user_id @organizer.user_id
json.profile_id @organizer.user&.profile&.id
json.name @organizer.name
