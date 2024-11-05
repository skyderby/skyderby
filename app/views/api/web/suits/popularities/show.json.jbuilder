json.array! @suits do |suit|
  json.suitId suit.id
  json.popularity suit.popularity.to_f
end
