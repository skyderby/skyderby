json.key_format! camelize: :lower

json.extract! team, :id, :name

json.competitor_ids team.competitor_ids
