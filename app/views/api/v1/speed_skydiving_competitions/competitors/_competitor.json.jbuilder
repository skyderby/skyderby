json.extract! competitor, :id, :profile_id, :category_id, :team_id, :assigned_number
json.created_at competitor.created_at.iso8601
json.updated_at competitor.updated_at.iso8601
