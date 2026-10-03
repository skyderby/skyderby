json.key_format! camelize: :lower

json.id @round.id
json.number @round.number
json.completed @round.completed
json.completed_at @round.completed_at&.utc&.iso8601
