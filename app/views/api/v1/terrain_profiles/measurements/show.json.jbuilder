measurements = [altitude: 0, distance: 0] + @measurements.map do |el|
  { altitude: el.altitude, distance: el.distance }
end

json.array! measurements do |measurement|
  json.altitude measurement[:altitude]
  json.distance measurement[:distance]
end
