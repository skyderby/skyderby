json.key_format! camelize: :lower

event = @event
timeline = event.standings
rounds = timeline.rounds.to_a
tasks = rounds.map(&:discipline).uniq
categories = event.categories.sort_by(&:order)
competitors = preload_competitors(categories.flat_map(&:competitors), :event)

json.partial! 'api/v1/competitions/event', event: event
json.rules event.rules
json.deletable event.deletable?
json.window do
  json.from event.range_from
  json.to event.range_to
end
json.wind_cancellation event.wind_cancellation
json.apply_penalty_to_score event.apply_penalty_to_score
json.use_teams event.use_teams
json.use_open_standings event.use_open_standings?
json.designated_lane_start event.designated_lane_start
json.lane_validation_stops_at event.lane_validation_stops_at

json.boards do
  json.child! do
    json.key 'scoreboard'
    json.label t('events.scoreboard')
    json.path api_v1_performance_competition_scoreboard_path(event)
  end
  if event.use_open_standings?
    json.child! do
      json.key 'open'
      json.label t('events.open_event')
      json.path api_v1_performance_competition_open_scoreboard_path(event)
    end
  end
  tasks.each do |task|
    json.child! do
      json.key 'task'
      json.discipline task
      json.label discipline_label(task)
      json.path api_v1_performance_competition_task_scoreboard_path(event, task)
    end
  end
  if event.use_teams
    json.child! do
      json.key 'teams'
      json.label t('events.teams')
      json.path api_v1_performance_competition_team_scoreboard_path(event)
    end
  end
end

json.categories categories do |category|
  json.id category.id
  json.name category.name
  json.order category.order
end

json.rounds rounds do |round|
  json.id round.id
  json.discipline round.discipline
  json.discipline_label discipline_label(round.discipline)
  json.number round.number
  json.code round.code
  json.label performance_round_label(round)
  json.unit discipline_unit_label(round.discipline)
  json.completed round.completed
  json.completed_at round.completed_at&.utc&.iso8601
  json.timeline_position timeline.timeline_position(round)
end

json.competitors competitors do |competitor|
  json.partial! 'api/v1/competitions/competitor', competitor: competitor
  json.category_id competitor.section_id
  json.country_id competitor.country_id
  json.team_id competitor.team_id
end

json.teams event.teams.sort_by(&:name) do |team|
  json.id team.id
  json.name team.name
  json.country_id team.country_id
  json.competitor_ids competitors.select { |competitor| competitor.team_id == team.id }.map(&:id)
end

json.reference_points event.reference_points do |reference_point|
  json.id reference_point.id
  json.name reference_point.name
  json.latitude api_float(reference_point.latitude)
  json.longitude api_float(reference_point.longitude)
end

json.partial! 'api/v1/competitions/organizers_and_sponsors', organizable: event
