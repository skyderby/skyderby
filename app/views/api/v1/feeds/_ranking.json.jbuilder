competition = card.competition

json.type 'ranking'
json.id "ranking-#{competition.id}-#{card.date.iso8601}"
json.date card.date.iso8601
json.occurred_at card.sort_time.utc.iso8601
json.top_size VirtualCompetition::TopEntry::SIZE
json.label t('feed.rankings.entered_top', count: VirtualCompetition::TopEntry::SIZE)
json.year card.year
json.competition do
  json.id competition.id
  json.title competition.title
  json.discipline competition.discipline
  json.annual competition.annual?
  json.unit competition_unit(competition)
end
json.rows card.rows do |row|
  json.rank row.rank
  json.result row.result&.to_f
  json.result_formatted format_result(row.result, competition).to_s
  json.track_id row.track.id
  json.profile { json.partial! 'api/v1/virtual_competitions/profile', profile: row.profile }
end
