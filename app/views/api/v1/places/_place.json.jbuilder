json.key_format! camelize: :lower

json.extract! place, :id, :name, :country_id
json.msl place.msl.to_f
