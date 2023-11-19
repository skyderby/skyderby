json.data scores do |row|
  json.extract! row,
                :rank,
                :profile_id,
                :suit_id,
                :track_id,
                :result,
                :highest_gr,
                :highest_speed
  json.place_id row.track.place_id
  json.user_provided_place_name row.track.location
  json.recorded_at row.recorded_at.iso8601
end

json.extract! scores, :current_page, :total_pages

json.relations do
  profiles = scores.map(&:profile).uniq.compact
  json.profiles profiles, partial: 'api/v1/profiles/profile', as: :profile

  places = scores.map { |row| row.track.place }.uniq.compact
  json.places places, partial: 'api/v1/places/place', as: :place, without_photos: true

  countries = (profiles.map(&:country) + places.map(&:country)).uniq.compact
  json.countries countries, partial: 'api/v1/countries/country', as: :country

  suits = scores.map(&:suit).uniq.compact
  json.suits suits, partial: 'api/v1/suits/suit', as: :suit

  manufacturers = suits.map(&:manufacturer).uniq.compact
  json.manufacturers manufacturers, partial: 'api/v1/manufacturers/manufacturer', as: :manufacturer
end
