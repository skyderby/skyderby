json.partial!('api/v1/virtual_competitions/place', place:)
json.country_name place.country&.name
json.msl api_float(place.msl)
json.latitude api_float(place.latitude)
json.longitude api_float(place.longitude)
