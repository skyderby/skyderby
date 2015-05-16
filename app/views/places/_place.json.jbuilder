json.extract! place, :id, :name
json.country do |json|
  json.extract! place.country, :id, :name
end
