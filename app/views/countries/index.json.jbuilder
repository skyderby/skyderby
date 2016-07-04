json.cache! @countries do
  json.array! @countries do |country|
    json.extract! country, :id, :name
  end
end
