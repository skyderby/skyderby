json.key_format! camelize: :lower

json.id @team.id
json.name @team.name
json.competitor_ids @team.competitors.ids
