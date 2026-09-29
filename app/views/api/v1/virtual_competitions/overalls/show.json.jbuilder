json.key_format! camelize: :lower

json.scope { json.type 'overall' }
json.partial! 'api/v1/virtual_competitions/ranking', ranking: @ranking
