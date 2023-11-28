json.extract! @events, :current_page, :total_pages

json.items @events do |record|
  json.extract! \
    record,
    :name,
    :starts_at,
    :status,
    :visibility,
    :responsible_id,
    :place_id,
    :competitors_count,
    :range_from,
    :range_to,
    :is_official,
    :updated_at,
    :created_at

  json.country_ids record.country_ids || []
  type =
    if record.event_type == 'Event' && %w[speed_distance_time fai].include?(record.rules)
      'performance_competition'
    elsif record.event_type == 'Event' && record.rules == 'hungary_boogie'
      'hungary_boogie'
    else
      record.event_type.underscore.downcase
    end

  json.id record.event_id
  json.type type.camelize(:lower)

  json.active record.active?
end

json.relations do
  places = @events.map(&:place).compact
  json.places places, partial: 'api/v1/places/place', as: :place, without_photos: true

  countries = places.map(&:country).compact.uniq
  json.countries countries, partial: 'api/v1/countries/country', as: :country
end

json.permissions do
  json.can_create policy(Event).create?
end
