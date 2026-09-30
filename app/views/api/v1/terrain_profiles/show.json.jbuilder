json.key_format! camelize: :lower

json.partial! 'api/v1/terrain_profiles/terrain_profile', terrain_profile: @terrain_profile

measurements = @terrain_profile.measurements.map { { altitude: it.altitude, distance: it.distance } }
measurements.unshift({ altitude: 0, distance: 0 }) unless measurements.first == { altitude: 0, distance: 0 }

json.measurements measurements do |measurement|
  json.altitude measurement[:altitude]
  json.distance measurement[:distance]
end
