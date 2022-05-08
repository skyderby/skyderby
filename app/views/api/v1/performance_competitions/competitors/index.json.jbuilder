json.items @competitors, partial: 'competitor', as: :competitor

json.relations do
  profiles = @competitors.map(&:profile).compact
  json.profiles profiles, partial: 'api/v1/profiles/profile', as: :profile

  countries = profiles.map(&:country).uniq.compact
  json.countries countries, partial: 'api/v1/countries/country', as: :country

  suits = @competitors.map(&:suit).compact
  json.suits suits, partial: 'api/v1/suits/suit', as: :suit
end
