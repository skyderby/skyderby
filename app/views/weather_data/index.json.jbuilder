json.array! @weather_data do |weather_datum|
  json.partial! weather_datum, as: :weather_datum
end
