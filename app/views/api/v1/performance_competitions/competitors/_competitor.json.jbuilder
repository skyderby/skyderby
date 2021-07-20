json.extract! competitor, :id, :suit_id, :profile_id, :team_id, :assigned_number
json.category_id competitor.section_id
json.created_at competitor.created_at.iso8601
json.updated_at competitor.updated_at.iso8601
