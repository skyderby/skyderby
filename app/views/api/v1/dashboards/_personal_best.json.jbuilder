json.type :personal_best
json.discipline discipline
json.prefix t('dashboard.personal_bests.prefix')
json.label label

if best
  unit = competition_unit(best.competition)
  json.value best.result
  json.formatted_value format_result(best.result, best.competition).to_s
  json.unit unit
  json.delta best.delta
  json.formatted_delta best.delta && [dashboard_delta_magnitude(best.delta), unit].compact_blank.join(' ')
  json.track_id best.track_id
  json.competition_id best.competition.id
else
  json.value nil
  json.formatted_value nil
  json.unit nil
  json.delta nil
  json.formatted_delta nil
  json.track_id nil
  json.competition_id nil
end
