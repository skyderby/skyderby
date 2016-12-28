json.results @countries do |country|
  json.id country.id
  json.text country.name
end
