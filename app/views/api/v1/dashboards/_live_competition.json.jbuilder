event = entry.event

json.type competition_type(event)
json.id event.id
json.name event.name
json.starts_at event.starts_at&.iso8601
json.location entry.location
json.athletes_count entry.athletes_count
json.athletes_label t('dashboard.live_competitions.athletes', count: entry.athletes_count)
