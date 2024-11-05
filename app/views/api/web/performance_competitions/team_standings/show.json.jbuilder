json.array! @standings.rows do |row|
  json.rank row[:rank]
  json.team_id row[:team].id
  json.total row[:score]
end
