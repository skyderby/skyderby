json.key_format! camelize: :lower

competition = @details.competition

json.competition_id competition.id
json.profile { json.partial! 'api/v1/virtual_competitions/profile', profile: @details.profile }
json.unit competition_unit(competition)
json.worldwide competition.worldwide?
json.chart @details.chart_points do |(recorded_at, result)|
  json.recorded_at recorded_at&.utc&.iso8601
  json.result result
end
json.results @details.top_results do |record|
  json.result record.result
  json.result_formatted format_result(record.result, competition).to_s
  json.recorded_at record.track.recorded_at&.utc&.iso8601
  if record.track.suit
    json.suit { json.partial! 'api/v1/virtual_competitions/suit', suit: record.track.suit }
  else
    json.suit nil
  end
  json.track { json.partial! 'api/v1/virtual_competitions/track', track: record.track }
end
