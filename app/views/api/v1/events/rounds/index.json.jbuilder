json.array! @rounds do |round|
  json.extract! round, :id, :discipline, :number
end
