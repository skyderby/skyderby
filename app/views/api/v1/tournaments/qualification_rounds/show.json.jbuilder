json.key_format! camelize: :lower

json.id @round.id
json.order @round.order
json.completed @round.completed || false
