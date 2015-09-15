json.extract! place, :id, :name, :msl, :latitude, :longitude

json.country do |json|
  json.extract! place.country, :id, :name
end

json.url place_path(place.id)
json.tracks_count place.tracks.public_track.count
json.pilots_count place.pilots.group_by(&:id).count
