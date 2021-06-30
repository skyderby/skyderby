json.extract! category, :id, :name, :position
json.created_at category.created_at.iso8601
json.updated_at category.updated_at.iso8601
