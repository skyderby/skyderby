json.key_format! camelize: :lower

json.extract! @tracks, :current_page, :total_pages

json.items @tracks do |track|
  json.extract! \
    track,
    :id,
    :kind,
    :visibility,
    :profile_id,
    :suit_id,
    :place_id,
    :missing_suit_name,
    :location,
    :comment

  json.pilot_name track.name
  json.distance track.distance&.result.to_i
  json.speed track.speed&.result.to_i
  json.time track.time&.result.to_f.round(1)
  json.created_at track.created_at.strftime('%d.%m.%Y')
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
