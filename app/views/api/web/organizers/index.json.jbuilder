json.items @organizers, partial: 'organizer', as: :organizer

json.relations do
  profiles = @organizers.map(&:profile).compact
  json.profiles profiles, partial: 'api/web/profiles/profile', as: :profile

  countries = profiles.map(&:country).compact
  json.countries countries, partial: 'api/web/countries/country', as: :country
end
