json.key_format! camelize: :lower

json.kind @new_place.kind
json.latitude api_float(@new_place.latitude)
json.longitude api_float(@new_place.longitude)
json.msl api_float(@new_place.msl)
json.anchor_available @new_place.anchor_available?
json.draggable_pin @new_place.draggable_pin?
json.allow_duplicate Place.creatable?
json.suggestions @new_place.suggestions do |place|
  json.id place.id
  json.name place.name
  json.country_code place.country&.code
  json.distance @new_place.distance_to(place)
end
