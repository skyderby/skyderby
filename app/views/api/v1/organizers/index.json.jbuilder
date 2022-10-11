json.items @organizers, partial: 'organizer', as: :organizer

json.relations do
  profiles = @organizers.map(&:profile).compact
  json.profiles profiles, partial: 'api/v1/profiles/profile', as: :profile

  countries = profiles.map(&:country).compact
  json.countries countries, partial: 'api/v1/countries/country', as: :country
end
