json.extract! place, :id, :name, :msl, :latitude, :longitude

json.tracks_count place.tracks_count
json.pilots_count place.pilots_count
json.url place_path(place.id)

json.country do |json|
  json.id place.country_id
  json.name place.country_name
end
