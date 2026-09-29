editable = series.editable?
competitions = series.competitions.includes(place: :country).order(:starts_at).to_a

json.type competition_type(series)
json.id series.id
json.name series.name
json.starts_at competitions.filter_map(&:starts_at).min&.iso8601
json.status series.status
json.status_label t("event_status.#{series.status}")
json.visibility series.visibility
json.is_official true
json.active series.active?
json.cumulative true
json.editable editable
json.surprise series.surprise? && !editable
json.updated_at series.updated_at&.utc&.iso8601
json.competitions competitions do |competition|
  json.type competition_type(competition)
  json.id competition.id
  json.name competition.name
  json.starts_at competition.starts_at&.iso8601
  json.status competition.status
  if competition.place
    json.place { json.partial! 'api/v1/virtual_competitions/place', place: competition.place }
  else
    json.place nil
  end
  json.path public_send(:"api_v1_#{competition_type(competition)}_path", competition.id)
end
