json.results @tournaments do |tournament|
  json.id tournament.id
  json.text tournament.name
end
