json.extract! result,
              :id,
              :competitor_id,
              :round_id,
              :track_id,
              :penalized,
              :penalty_reason,
              :penalty_size,
              :heading_within_window
json.result result.result.to_f
json.result_net result.result_net&.to_f
json.exit_altitude result.exit_altitude&.round
json.exited_at result.exited_at&.iso8601(3)
json.created_at result.created_at.iso8601
json.updated_at result.updated_at.iso8601
