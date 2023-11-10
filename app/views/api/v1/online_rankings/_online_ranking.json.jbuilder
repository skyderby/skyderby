json.extract! online_ranking, :id, :name, :featured
json.task online_ranking.discipline
json.created_at online_ranking.created_at.iso8601
json.updated_at online_ranking.updated_at.iso8601
