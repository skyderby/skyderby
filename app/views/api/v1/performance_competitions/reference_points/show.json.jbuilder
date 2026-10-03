json.key_format! camelize: :lower

json.id @reference_point.id
json.name @reference_point.name
json.latitude api_float(@reference_point.latitude)
json.longitude api_float(@reference_point.longitude)
