json.key_format! camelize: :lower

json.id @round.id
json.discipline @round.discipline
json.number @round.number
json.label performance_round_label(@round)
json.completed @round.completed
json.completed_at @round.completed_at&.utc&.iso8601
