json.array! @competitors do |competitor|
  json.extract! competitor, :id, :profile_id, :suit_id, :assigned_number
  json.category_id competitor.section_id
end
