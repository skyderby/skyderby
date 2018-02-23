json.results @lines do |country_name, lines|
  json.text country_name
  json.children lines do |line|
    json.id line.id
    json.text "#{line.place_name} - #{line.name}"
  end
end
