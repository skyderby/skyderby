json.relations do
  suits = tracks.map(&:suit).uniq.compact
  json.suits suits, partial: 'api/web/suits/suit', as: :suit

  manufacturers = suits.map(&:manufacturer).uniq.compact
  json.manufacturers manufacturers, partial: 'api/web/manufacturers/manufacturer', as: :manufacturer

  places = tracks.map(&:place).uniq.compact
  json.places places, partial: 'api/web/places/place', as: :place, without_photos: true

  profiles = tracks.map(&:pilot).uniq.compact
  json.profiles profiles, partial: 'api/web/profiles/profile', as: :profile

  countries = (places.map(&:country) + profiles.map(&:country)).compact.uniq
  json.countries countries, partial: 'api/web/countries/country', as: :country
end
