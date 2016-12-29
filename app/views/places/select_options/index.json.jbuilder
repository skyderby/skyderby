json.results @places do |group|
  json.text group.first
  json.children group.last do |place|
    json.id place.id
    json.text place.name
  end
end
