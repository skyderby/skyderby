json.items @competitors, partial: 'competitor', as: :competitor

json.relations do
  profiles = @competitors.map(&:profile).compact
  json.profiles profiles, partial: 'api/v1/profiles/profile', as: :profile

  countries = profiles.map(&:country).compact
  json.countries countries, partial: 'api/v1/countries/country', as: :country
end
