json.array! @rounds do |round|
  json.extract! round, :id, :number, :slug
  json.task round.discipline
  json.created_at round.created_at.iso8601
  json.updated_at round.updated_at.iso8601
end
