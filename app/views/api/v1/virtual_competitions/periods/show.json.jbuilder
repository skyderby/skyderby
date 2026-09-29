json.key_format! camelize: :lower

json.scope do
  json.type 'period'
  json.slug @interval.slug
  json.name @interval.name
  json.period_from @interval.period_from&.utc&.iso8601
  json.period_to @interval.period_to&.utc&.iso8601
end
json.partial! 'api/v1/virtual_competitions/ranking', ranking: @ranking
