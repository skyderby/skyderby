places = @places.group_by(&:country_name)

json.results places do |group|
  json.text group.first
  json.children group.last do |place|
    json.id place.id
    json.text place.name
  end
end

json.pagination do |json|
  json.more @places.next_page ? true : false
end
