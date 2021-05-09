json.key_format! camelize: :lower

json.extract! place, :id, :name, :country_id
json.latitude place.latitude.to_f
json.longitude place.longitude.to_f
json.msl place.msl.to_f
