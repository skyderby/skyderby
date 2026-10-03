json.key_format! camelize: :lower

event = @event
rounds = event.rounds.ordered.to_a
categories = event.categories.sort_by(&:position)
competitors = preload_competitors(event.competitors, :event)

json.partial! 'api/v1/competitions/event', event: event
json.use_teams event.use_teams
json.unit t('units.kmh')

json.boards do
  json.child! do
    json.key 'scoreboard'
    json.label t('events.scoreboard')
    json.path api_v1_speed_skydiving_competition_scoreboard_path(event)
  end
  json.child! do
    json.key 'open'
    json.label t('events.open_event')
    json.path api_v1_speed_skydiving_competition_open_scoreboard_path(event)
  end
  if event.use_teams
    json.child! do
      json.key 'teams'
      json.label t('events.teams')
      json.path api_v1_speed_skydiving_competition_team_scoreboard_path(event)
    end
  end
end

json.categories categories do |category|
  json.id category.id
  json.name category.name
  json.position category.position
end

json.rounds rounds do |round|
  json.id round.id
  json.number round.number
  json.completed round.completed
  json.completed_at round.completed_at&.utc&.iso8601
end

json.competitors competitors do |competitor|
  json.partial! 'api/v1/competitions/competitor', competitor: competitor
  json.category_id competitor.category_id
  json.team_id competitor.team_id
  json.country_id competitor.country_id
end

json.teams event.teams.sort_by(&:name) do |team|
  json.id team.id
  json.name team.name
  json.country_id team.country_id
  json.competitor_ids competitors.select { |competitor| competitor.team_id == team.id }.map(&:id)
end

json.partial! 'api/v1/competitions/organizers_and_sponsors', organizable: event
