json.key_format! camelize: :lower

event = @event
editable = event.editable?
surprise = event.surprise? && !editable
ranking = surprise ? [] : @standings.ranking
preload_competitors(ranking.flat_map { |row| row.ranks.compact.map(&:competitor) }, :event)
podium_enabled = ranking.size >= 3

json.board 'teams'
json.surprise surprise
json.editable editable
json.wind_cancellation do
  json.available event.wind_cancellation
  json.applied wind_cancellation?
end
json.until_round @standings.until_round
json.time_machine @standings.time_machine?
json.teams ranking do |row|
  json.id row.team.id
  json.name row.team.name
  json.rank row.rank
  json.on_podium podium_enabled && row.total_points.to_f.positive? && row.rank <= 3
  json.total_points row.total_points.to_f
  json.formatted_total_points format_points(row.total_points)
  json.members row.ranks.compact do |member|
    json.competitor_id member.competitor.id
    json.competitor { json.partial! 'api/v1/competitions/competitor', competitor: member.competitor }
    json.rank member.rank
    json.total_points member.total_points.to_f
    json.formatted_total_points format_points(member.total_points)
  end
end
