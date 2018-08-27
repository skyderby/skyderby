json.array! @competitors do |competitor|
  json.extract! competitor, :id, :name, :suit_id, :suit_name
  json.category_id competitor.section_id
  json.category_name competitor.section.name
end
