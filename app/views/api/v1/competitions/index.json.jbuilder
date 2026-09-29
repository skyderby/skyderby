json.key_format! camelize: :lower

json.items @competitions do |competition|
  type = competition.event_type.underscore
  json.type type
  json.id competition.event_id
  json.path public_send(:"api_v1_#{type}_path", competition.event_id)
  json.name competition.name
  json.starts_at competition.starts_at&.iso8601
  json.status competition.status
  json.status_label t("event_status.#{competition.status}")
  json.visibility competition.visibility
  json.is_official competition.is_official
  json.active competition.starts_at.present? && competition.active?
  json.cumulative competition.event_type.end_with?('Series')
  if competition.place
    json.place { json.partial! 'api/v1/virtual_competitions/place', place: competition.place }
  else
    json.place nil
  end
  if competition.range_from && competition.range_to
    json.window do
      json.from competition.range_from
      json.to competition.range_to
    end
  else
    json.window nil
  end
  json.competitors_count((competition.competitors_count || {}).map { |name, count| { name:, count: } })
  json.country_ids competition.country_ids || []
  json.updated_at competition.updated_at&.utc&.iso8601
end
json.page @competitions.current_page
json.per_page @competitions.limit_value
json.total_pages @competitions.total_pages
json.total_count @competitions.total_count
