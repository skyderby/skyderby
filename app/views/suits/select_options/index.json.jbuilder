suits = @suits.group_by(&:manufacturer_name)

json.results suits do |group|
  json.text group.first
  json.children group.last do |suit|
    json.id suit.id
    json.text suit.name
  end
end

json.pagination do |json|
  json.more @suits.next_page ? true : false
end
