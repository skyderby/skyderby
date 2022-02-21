json.extract! event,
              :id,
              :name,
              :starts_at,
              :visibility,
              :status,
              :competition_ids,
              :created_at,
              :updated_at

json.permissions do
  json.can_edit policy(event).edit?
end

json.relations do
  competitions = event.competitions
  json.competitions competitions,
                    partial: 'api/v1/speed_skydiving_competitions/speed_skydiving_competition',
                    as: :event

  places = event.competitions.map(&:place)
  json.places places, partial: 'api/v1/places/place', as: :place, without_photos: true

  countries = places.map(&:country).uniq
  json.countries countries, partial: 'api/v1/countries/country', as: :country
end
