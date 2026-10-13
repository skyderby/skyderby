json.discipline entry.discipline.discipline
json.parameter entry.discipline.parameter
json.unit competition_unit(entry.discipline)
json.result entry.result
json.result_formatted entry.result && format_result(entry.result, entry.discipline).to_s
json.gap entry.gap
json.best entry.best?
json.points entry.points
