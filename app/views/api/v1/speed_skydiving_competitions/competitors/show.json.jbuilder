json.key_format! camelize: :lower

competitor = preload_competitors([@competitor], :event).first

json.partial! 'api/v1/competitions/competitor', competitor: competitor
json.category_id competitor.category_id
json.team_id competitor.team_id
json.country_id competitor.country_id
