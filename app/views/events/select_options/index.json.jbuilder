json.results @events do |event|
  json.id event.id
  json.text event.name
end
