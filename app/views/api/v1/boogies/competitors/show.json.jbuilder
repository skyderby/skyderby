json.key_format! camelize: :lower

json.partial! 'api/v1/competitions/competitor', competitor: @competitor
json.category_id @competitor.section_id
