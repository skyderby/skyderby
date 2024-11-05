json.array! @scoreboard.standings do |row|
  json.rank row[:rank]
  json.competitor_id row[:competitor].id
  json.total row[:total].to_f
  json.average row[:average].to_f
end
