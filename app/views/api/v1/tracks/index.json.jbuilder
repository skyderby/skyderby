json.key_format! camelize: :lower

json.extract! @tracks, :current_page, :total_pages

json.items @tracks do |track|
  json.extract! \
    track,
    :id,
    :kind,
    :profile_id,
    :suit_id,
    :place_id,
    :name,
    :comment

  json.pilot_name track.pilot&.name || track.name
  json.suit_name track.missing_suit_name
  json.location track.location
  json.distance track.distance&.result.to_i
  json.speed track.speed&.result.to_i
  json.time track.time&.result.to_f.round(1)
  json.recorded_at track.recorded_at.strftime('%d.%m.%Y')
end

json.relations do
  suits = @tracks.map(&:suit).compact
  json.suits suits, partial: 'api/v1/suits/suit', as: :suit

  manufacturers = suits.map(&:manufacturer).compact
  json.manufacturers manufacturers, partial: 'api/v1/manufacturers/manufacturer', as: :manufacturer

  places = @tracks.map(&:place).compact
  json.places places, partial: 'api/v1/places/place', as: :place, include_photos: false

  profiles = @tracks.map(&:pilot).compact
  json.profiles profiles, partial: 'api/v1/profiles/profile', as: :profile

  countries = (places.map(&:country) + profiles.map(&:country)).compact.uniq
  json.countries countries, partial: 'api/v1/countries/country', as: :country
end
