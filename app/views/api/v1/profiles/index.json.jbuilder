json.key_format! camelize: :lower

json.extract! @profiles, :current_page, :total_pages

json.items @profiles, partial: 'profile', as: :profile

json.relations do
  countries = @profiles.map(&:country).compact.uniq
  json.countries countries, partial: 'api/v1/countries/country', as: :country
end
