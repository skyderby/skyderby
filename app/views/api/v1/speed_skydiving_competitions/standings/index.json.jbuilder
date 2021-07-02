json.array! @standings.categories do |category_standings|
  json.category_id category_standings[:category].id
  json.rows category_standings[:standings] do |row|
    json.competitor_id row.id
  end
end
