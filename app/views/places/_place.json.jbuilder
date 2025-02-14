json.extract! place, :id, :name, :msl, :latitude, :longitude
json.country do |json|
  json.id place.country_id
  json.name place.country_name
end
