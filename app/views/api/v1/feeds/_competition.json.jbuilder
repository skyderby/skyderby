event = card.event

json.type 'competition'
json.id "competition-#{competition_type(event)}-#{event.id}"
json.date card.date.iso8601
json.occurred_at card.sort_time.utc.iso8601
json.event do
  json.id event.id
  json.type competition_type(event)
  json.name event.name
  json.place_name event.place&.name
  json.starts_at event.starts_at.iso8601
  json.live card.live?
  json.athletes_count card.athletes_count
  json.athletes_label t('dashboard.live_competitions.athletes', count: card.athletes_count)
end
json.podium card.podium, partial: 'api/v1/feeds/standing', as: :standing
json.followed card.followed_standings, partial: 'api/v1/feeds/standing', as: :standing
json.followed_without_results card.followed_without_results do |profile|
  json.partial! 'api/v1/virtual_competitions/profile', profile:
end
