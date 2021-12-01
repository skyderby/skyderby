json.key_format! camelize: :lower

if @track.competitive?
  json.competition_result do
    event = @track.event_result.event
    event_type =
      case event
      when Event
        event.hungary_boogie? ? :boogie : :performance
      when SpeedSkydivingCompetition
        :speed_skydiving
      when Tournament
        :tournament
      end

    json.event_id event.id
    json.event_name event.name
    json.event_type event_type
    json.task @track.event_result.round_discipline
    json.result @track.event_result.result.to_f
  end
else
  json.competition_result nil
end

if @track.skydive?
  json.best_results @track.results do |record|
    json.task record.discipline
    json.result record.result.to_f
    json.extract! record, :range_from, :range_to
  end
else
  json.best_results []
end

if @track.base?
  json.total_results @track.track_results do |record|
    json.task record.discipline
    json.result record.result.to_f
  end
else
  json.total_results []
end

json.online_ranking_results @track.virtual_competition_results do |result|
  json.ranking_id result.virtual_competition_id
  json.ranking_name result.virtual_competition.name
  json.group_name result.virtual_competition.group_name
  json.task result.virtual_competition.discipline
  json.result result.result.to_f
end
