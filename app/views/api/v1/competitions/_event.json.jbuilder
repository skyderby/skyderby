editable = event.editable?
status = local_assigns[:status] || event.status

json.type competition_type(event)
json.id event.id
json.name event.name
json.starts_at event.starts_at&.iso8601
json.status status
json.status_label t("event_status.#{status}")
json.visibility event.visibility
json.is_official event.is_official
json.active event.active?
json.editable editable
json.surprise event.surprise? && !editable
json.updated_at event.updated_at&.utc&.iso8601
if event.place
  json.place { json.partial! 'api/v1/competitions/place', place: event.place }
else
  json.place nil
end
