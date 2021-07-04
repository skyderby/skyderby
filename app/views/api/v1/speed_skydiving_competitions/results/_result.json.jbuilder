json.extract! result, :id, :event_id, :competitor_id, :round_id, :track_id
json.result result.result.to_f
json.created_at result.created_at.iso8601
json.updated_at result.updated_at.iso8601
