json.key_format! camelize: :lower

json.array! @suits_popularity.map do |record|
  json.manufacturer_name record.manufacturer_name
  json.name record.name
  json.y record.popularity.to_f
end
