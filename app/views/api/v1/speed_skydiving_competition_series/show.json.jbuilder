json.key_format! camelize: :lower

json.partial! 'api/v1/competitions/series', series: @series
json.scoreboard_available false
json.scoreboard_path nil
json.rounds @series.rounds.order(:number) do |round|
  json.id round.id
  json.number round.number
  json.completed round.completed_at.present?
  json.completed_at round.completed_at&.utc&.iso8601
end
