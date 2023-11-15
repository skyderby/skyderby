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
  json.created_at track.created_at.iso8601
  json.updated_at track.created_at.iso8601
  json.recorded_at track.recorded_at.iso8601
end

json.relations do
  suits = @tracks.map(&:suit).uniq.compact
  json.suits suits, partial: 'api/v1/suits/suit', as: :suit

  manufacturers = suits.map(&:manufacturer).uniq.compact
  json.manufacturers manufacturers, partial: 'api/v1/manufacturers/manufacturer', as: :manufacturer

  places = @tracks.map(&:place).uniq.compact
  json.places places, partial: 'api/v1/places/place', as: :place, without_photos: true

  profiles = @tracks.map(&:pilot).uniq.compact
  json.profiles profiles, partial: 'api/v1/profiles/profile', as: :profile

  countries = (places.map(&:country) + profiles.map(&:country)).uniq.compact
  json.countries countries, partial: 'api/v1/countries/country', as: :country
end
