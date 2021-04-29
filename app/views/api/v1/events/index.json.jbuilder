json.key_format! camelize: :lower

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
    :country_ids,
    :range_from,
    :range_to,
    :is_official,
    :updated_at,
    :created_at

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
