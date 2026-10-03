json.id result.id
json.round_id result.round_id
json.round_number result.round.number
json.track_id result.track_id
json.status completed_rounds.include?(result.round) ? 'final' : 'provisional'
json.result api_float(result.result, 2)
json.final_result result.final_result.round(2)
json.formatted_final_result format_speed(result.final_result)
json.penalized result.penalized?
json.penalty_size result.penalty_size.to_f.round(2)
json.penalty_reason result.penalized? ? result.penalty_reason : nil
json.penalties result.penalties do |penalty|
  json.id penalty.id
  json.percent penalty.percent
  json.reason penalty.reason
end
json.created_at result.created_at&.utc&.iso8601
