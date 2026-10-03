discipline = result.round.discipline

json.id result.id
json.competitor_id result.competitor_id
json.round_id result.round_id
json.track_id result.track_id
json.result api_float(result.result)
json.formatted_result format_discipline_value(discipline, result.result)
json.result_net api_float(result.result_net)
json.formatted_result_net format_discipline_value(discipline, result.result_net)
json.penalized result.penalized?
json.penalty_size result.penalized? ? result.penalty_size.to_i : 0
json.penalty_reason result.penalized? ? result.penalty_reason : nil
json.validated result.validated?
json.exited_at result.exited_at&.utc&.iso8601(3)
