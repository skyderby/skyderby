event = entry.event

json.type competition_type(event)
json.id event.id
json.name event.name
json.starts_at event.starts_at&.iso8601
json.rank entry.hidden_place ? nil : entry.place
json.live entry.live
json.hidden_rank entry.hidden_place
