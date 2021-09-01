json.key_format! camelize: :lower

json.extract! @places, :current_page, :total_pages

json.items @places, partial: 'place', as: :place

json.relations do
  countries = @places.map(&:country).uniq
  json.countries countries, partial: 'api/v1/countries/country', as: :country
end
