measurements = @measurements.map { |el| { altitude: el.altitude, distance: el.distance } }
exit_point = { altitude: 0, distance: 0 }
measurements.unshift(exit_point) unless measurements.first == exit_point

json.name @terrain_profile.full_name
json.measurements measurements do |measurement|
  json.altitude measurement[:altitude]
  json.distance measurement[:distance]
end
