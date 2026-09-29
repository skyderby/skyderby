json.key_format! camelize: :lower

event = @event
editable = event.editable?
surprise = event.surprise? && !editable
rows = surprise ? [] : @standings.rows
preload_competitors(rows.flat_map { |row| row[:competitors].to_a }, :event)
podium_enabled = rows.size >= 3

json.board 'teams'
json.surprise surprise
json.editable editable
json.unit t('units.kmh')
json.teams rows do |row|
  total = row[:total]
  json.id row[:team].id
  json.name row[:team].name
  json.rank row[:rank]
  json.on_podium podium_enabled && total.to_f.positive? && row[:rank] <= 3
  json.total api_float(total, 2)
  json.formatted_total format_speed(total)
  json.members row[:competitors] do |competitor|
    score = row[:scores_by_competitor][competitor]
    json.competitor_id competitor.id
    json.competitor { json.partial! 'api/v1/competitions/competitor', competitor: }
    json.score score && api_float(score[:score], 2)
    json.formatted_score score && format_speed(score[:score])
    json.percent score && api_float(score[:percent], 1)
  end
end
