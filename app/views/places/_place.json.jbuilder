json.extract! place, :id, :name, :msl
json.country do |json|
  json.extract! place.country, :id, :name
end
