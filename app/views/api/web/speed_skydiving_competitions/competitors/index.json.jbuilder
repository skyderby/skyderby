json.items @competitors, partial: 'competitor', as: :competitor, cached: true

json.relations do
  profiles = @competitors.map(&:profile).compact
  json.profiles profiles, partial: 'api/web/profiles/profile', as: :profile, cached: true

  countries = profiles.map(&:country).compact
  json.countries countries, partial: 'api/web/countries/country', as: :country, cached: true
end
