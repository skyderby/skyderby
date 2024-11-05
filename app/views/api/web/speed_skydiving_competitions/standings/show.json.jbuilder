json.array! @standings.categories do |category_standings|
  json.category_id category_standings[:category].id
  json.rows category_standings[:standings] do |row|
    json.rank row[:rank]
    json.competitor_id row[:competitor].id
    json.total row[:total].to_f
    json.average row[:average].to_f
  end
end
