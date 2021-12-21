json.extract! result,
              :id,
              :event_id,
              :competitor_id,
              :round_id,
              :track_id,
              :exit_altitude,
              :penalty_size

json.result result.result&.to_f
json.final_result result.final_result&.to_f
json.window_start_time result.window_start_time&.iso8601(3)
json.window_end_time result.window_end_time&.iso8601(3)
json.penalties result.penalties do |penalty|
  json.extract! penalty, :percent, :reason
end
json.created_at result.created_at.iso8601
json.updated_at result.updated_at.iso8601
