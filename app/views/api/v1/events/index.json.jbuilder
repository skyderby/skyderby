json.key_format! camelize: :lower

json.extract! @events, :current_page, :total_pages

json.items @events do |record|
  json.extract! \
    record,
    :name,
    :rules,
    :starts_at,
    :status,
    :visibility,
    :responsible_id,
    :place_id,
    :competitors_count,
    :country_ids,
    :updated_at,
    :created_at

  json.path polymorphic_path(record.event)
end
