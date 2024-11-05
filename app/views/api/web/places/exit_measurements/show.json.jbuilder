measurements = [altitude: 0, distance: 0] +
               @exit_measurements.map { |el| { altitude: el.altitude, distance: el.distance } }

json.array! measurements do |measurement|
  json.altitude measurement[:altitude]
  json.distance measurement[:distance]
end
