json.results @profiles do |profile|
  json.id profile.id
  json.text profile.name
end

json.pagination do |json|
  json.more @profiles.next_page ? true : false
end
