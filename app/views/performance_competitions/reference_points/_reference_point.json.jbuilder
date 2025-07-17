json.id reference_point.id
json.latitude reference_point.latitude.to_f
json.longitude reference_point.longitude.to_f
json.name strip_tags(reference_point.name)
