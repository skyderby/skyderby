measurements = [altitude: 0, distance: 0] +
               @measurements.map { |el| { altitude: el.altitude, distance: el.distance } }

json.name "#{@jump_profile.place.name} - #{@jump_profile.name}"
json.measurements measurements do |measurement|
  json.altitude measurement[:altitude]
  json.distance measurement[:distance]
end
