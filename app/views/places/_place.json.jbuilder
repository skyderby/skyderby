json.extract! place, :id, :name, :msl

json.country do |json|
  json.extract! place.country, :id, :name
end

with_additional_info = local_assigns.fetch :with_additional_info, false

if with_additional_info
  json.latitude place.latitude
  json.longitude place.longitude
  json.url place_path(place.id)
  json.tracks_count place.tracks.accessible_by(current_user).count
  json.pilots_count place.pilots_accessible_by(current_user).count
end
