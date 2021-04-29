json.array! @rounds do |round|
  json.extract! round, :id, :number, :slug
  json.task round.discipline
end
