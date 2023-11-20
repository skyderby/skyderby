json.data @standings do |category, rows|
  json.category category
  json.rows rows do |row|
    json.extract! row, :rank, :profile_id
    json.results row.results.deep_transform_keys { _1.to_s.camelize(:lower) }
    json.total_points row.total_points.to_f
  end
end

json.relations do
  profiles = @standings.values.flatten.map(&:profile).uniq.compact
  json.profiles profiles, partial: 'api/v1/profiles/profile', as: :profile
end
