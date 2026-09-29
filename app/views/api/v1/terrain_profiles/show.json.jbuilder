json.key_format! camelize: :lower

json.extract! @terrain_profile, :id, :name, :place_id
json.full_name @terrain_profile.full_name

measurements = @terrain_profile.measurements.map { { altitude: it.altitude, distance: it.distance } }
measurements.unshift({ altitude: 0, distance: 0 }) unless measurements.first == { altitude: 0, distance: 0 }

json.measurements measurements do |measurement|
  json.altitude measurement[:altitude]
  json.distance measurement[:distance]
end
