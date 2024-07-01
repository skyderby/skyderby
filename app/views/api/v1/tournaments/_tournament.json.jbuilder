json.extract! tournament, :id, :name

json.permissions do
  json.can_edit policy(tournament).edit?
end
