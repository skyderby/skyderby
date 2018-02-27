json.results @users do |user|
  json.id user.id
  json.text user.name
end

json.pagination do |json|
  json.more @users.next_page ? true : false
end
