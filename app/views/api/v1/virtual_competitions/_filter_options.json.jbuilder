json.jump_kinds jump_kinds do |value|
  json.value value
  json.label t("virtual_competitions.show.jump_kinds.#{value || 'all'}")
end
json.genders genders do |value|
  json.value value
  json.label t("virtual_competitions.show.genders.#{value || 'open'}")
end
