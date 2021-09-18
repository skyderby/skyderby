json.key_format! camelize: :lower

json.partial! partial: 'api/v1/tracks/track', track: @track

json.relations do
  suits = [@track.suit].compact
  json.suits suits, partial: 'api/v1/suits/suit', as: :suit

  manufacturers = suits.map(&:manufacturer).compact
  json.manufacturers manufacturers, partial: 'api/v1/manufacturers/manufacturer', as: :manufacturer

  places = [@track.place].compact
  json.places places, partial: 'api/v1/places/place', as: :place, include_photos: false

  profiles = [@track.pilot].compact
  json.profiles profiles, partial: 'api/v1/profiles/profile', as: :profile

  countries = (places.map(&:country) + profiles.map(&:country)).compact.uniq
  json.countries countries, partial: 'api/v1/countries/country', as: :country
end
