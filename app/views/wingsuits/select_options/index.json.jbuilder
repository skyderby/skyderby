json.results @suits do |group|
  json.text group.first
  json.children group.last do |suit|
    json.id suit.id
    json.text suit.name
  end
end
