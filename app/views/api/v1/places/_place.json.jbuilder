include_photos = defined?(include_photos) ? include_photos : true

json.key_format! camelize: :lower

json.extract! place, :id, :name, :country_id, :kind
json.latitude place.latitude.to_f
json.longitude place.longitude.to_f
json.msl place.msl.to_f

if include_photos
  json.cover place.photo_url

  json.photos place.photos do |photo|
    json.id photo.id
    json.large photo.image.url(:large)
    json.thumb photo.image.url(:thumb)
  end
end
