without_photos ||= false

json.key_format! camelize: :lower

json.extract! place, :id, :name, :country_id, :kind
json.latitude place.latitude.to_f
json.longitude place.longitude.to_f
json.msl place.msl.to_f

unless without_photos
  json.cover place.photo_url

  json.photos place.photos do |photo|
    json.id photo.id
    json.large photo.image_url(:large)
    json.thumb photo.image_url(:thumb)
  end
end
