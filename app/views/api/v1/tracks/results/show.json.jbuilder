json.key_format! camelize: :lower

if @results.competitive?
  event_result = @results.event_result
  json.event_result do
    json.event_id event_result.event_id
    json.event_name event_result.event&.name
    json.event_kind event_result.event&.model_name&.element
    json.discipline event_result.round_discipline
    json.discipline_label discipline_label(event_result.round_discipline)
    json.result event_result.result && discipline_result(event_result.round_discipline, event_result.result)
    json.unit discipline_unit_label(event_result.round_discipline)
  end
else
  json.event_result nil
end

json.viewer_is_pilot @results.recorded_by?(current_user)
json.online_results @results.online_results do |result|
  competition = result.competition
  json.competition_id competition.id
  json.competition_name competition.name
  json.group_name competition.group_name
  json.discipline competition.discipline
  json.annual competition.annual?
  json.year competition.annual? ? @results.recorded_at&.year : nil
  json.result format_result(result.result, competition)
  json.unit competition_unit(competition)
  json.valid result.valid?
  json.ranked result.ranked?
  json.personal_best result.personal_best?
  json.top_percent result.top_percent
  json.own_rank result.own_rank
  json.own_total result.own_total
  json.gap_from_record result.gap_from_record&.positive? ? format_result(result.gap_from_record, competition) : nil
end
json.online_empty_reason @results.online_results? ? nil : @results.online_placeholder_reason

json.best_results do
  %i[distance speed time].each do |discipline|
    record = @results.skydive? ? @results.public_send(discipline) : nil
    if record
      json.set! discipline do
        json.result discipline == :time ? record.result.round(1) : record.result.to_i
        json.range_from record.range_from
        json.range_to record.range_to
      end
    else
      json.set! discipline, nil
    end
  end
end
