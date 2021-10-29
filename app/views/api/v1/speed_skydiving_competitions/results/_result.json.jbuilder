json.extract! result, :id, :event_id, :competitor_id, :round_id, :track_id, :exit_altitude
json.result result.result&.to_f
json.window_start_time result.window_start_time&.iso8601(3)
json.window_end_time result.window_end_time&.iso8601(3)
json.created_at result.created_at.iso8601
json.updated_at result.updated_at.iso8601
