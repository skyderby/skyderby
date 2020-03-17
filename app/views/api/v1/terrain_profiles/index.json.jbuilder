json.key_format! camelize: :lower

json.items @terrain_profiles do |terrain_profile|
  json.extract! terrain_profile, :id, :place_id, :name
end
