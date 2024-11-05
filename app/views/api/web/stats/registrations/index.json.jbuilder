json.array! @registrations do |row|
  json.month row.month.strftime('%Y-%m-%d')
  json.count row.count
end
