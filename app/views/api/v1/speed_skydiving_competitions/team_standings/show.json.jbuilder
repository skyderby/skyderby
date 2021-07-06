json.array! @standings.rows do |row|
  json.extract! row, :rank, :team_id
  json.total row[:total]&.to_f
end
