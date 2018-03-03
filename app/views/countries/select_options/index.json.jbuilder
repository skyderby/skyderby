json.results @countries do |country|
  json.id country.id
  json.text country.name
end

json.pagination do |json|
  json.more @countries.next_page ? true : false
end
