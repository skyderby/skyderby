json.extract! place, :id, :name, :msl

json.country do |json|
  json.id place.country_id
  json.name place.country_name
end

with_additional_info = local_assigns.fetch :with_additional_info, false

if with_additional_info
  json.latitude place.latitude
  json.longitude place.longitude
  json.url place_path(place.id)
  json.tracks_count place.tracks_count
  json.pilots_count place.pilots_count
end
