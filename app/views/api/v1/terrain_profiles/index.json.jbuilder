json.items @terrain_profiles, partial: 'terrain_profile', as: :terrain_profile

json.relations do
  places = @terrain_profiles.map(&:place)
  json.places places, partial: 'api/v1/places/place', as: :place
end
