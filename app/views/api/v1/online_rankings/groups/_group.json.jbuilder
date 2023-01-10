json.extract! group, :id, :name, :cumulative, :featured
json.created_at group.created_at.iso8601
json.updated_at group.updated_at.iso8601
