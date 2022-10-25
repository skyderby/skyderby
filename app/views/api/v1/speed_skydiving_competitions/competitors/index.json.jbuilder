json.items @competitors, partial: 'competitor', as: :competitor, cached: true

json.relations do
  profiles = @competitors.map(&:profile).compact
  json.profiles profiles, partial: 'api/v1/profiles/profile', as: :profile, cached: true

  countries = profiles.map(&:country).compact
  json.countries countries, partial: 'api/v1/countries/country', as: :country, cached: true
end
