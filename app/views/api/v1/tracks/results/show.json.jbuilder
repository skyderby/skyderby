json.key_format! camelize: :lower

if @track.competitive?
  json.competition_result do
    json.event_id @track.event_result.event_id
    json.event_name @track.event_result.event.name
    json.event_path event_path(@track.event_result.event)
    json.task @track.event_result.round_discipline
    json.result @track.event_result.result
  end
else
  json.competition_result nil
end

if @track.skydive?
  json.best_results @track.track_results do |result|
    json.task result.discipline
    json.extract! result, :result, :range_from, :range_to
  end
else
  json.best_results []
end

if @track.base?
  json.total_results @track.track_results do |result|
    json.task result.discipline
    json.extract! result, :result
  end
else
  json.total_results []
end

json.online_ranking_results @track.virtual_competition_results do |result|
  json.id result.id
  json.ranking_path virtual_competition_path(result.virtual_competition)
  json.group_name result.virtual_competition.group_name
  json.ranking_name result.virtual_competition.name
  json.task result.virtual_competition.discipline
  json.result result.result
end
