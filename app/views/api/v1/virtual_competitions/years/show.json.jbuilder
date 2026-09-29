json.key_format! camelize: :lower

json.scope do
  json.type 'year'
  json.year @ranking.year
end
json.partial! 'api/v1/virtual_competitions/ranking', ranking: @ranking
