json.key_format! camelize: :lower

json.results @results do |result|
  json.partial! 'api/v1/performance_competitions/results/record', result:
end
