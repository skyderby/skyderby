json.key_format! camelize: :lower

json.array! @donations do |row|
  json.month row.month.to_date.iso8601
  json.people_count row.people_count
  json.amount row.amount.to_f
end
