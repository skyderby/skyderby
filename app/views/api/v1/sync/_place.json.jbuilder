json.extract! place, :id, :name, :kind, :country_id
json.latitude place.latitude&.to_f
json.longitude place.longitude&.to_f
json.msl place.msl&.to_f
json.cover_photo_url stored_file_url(place.cover_photo&.image_url(:large))
json.updated_at place.updated_at
