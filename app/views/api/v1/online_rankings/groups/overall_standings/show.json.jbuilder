json.array! @standings do |category, rows|
  json.category category
  json.rows rows do |row|
    json.extract! row, :rank, :profile_id
    json.results row.results.deep_transform_keys { _1.to_s.camelize(:lower) }
  end
end
