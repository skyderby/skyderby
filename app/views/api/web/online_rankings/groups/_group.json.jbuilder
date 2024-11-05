json.extract! group, :id, :name, :cumulative, :featured
json.onlineRankingIds group.virtual_competition_ids

json.created_at group.created_at.iso8601
json.updated_at group.updated_at.iso8601

json.permissions do
  json.can_edit policy(group).edit?
end
