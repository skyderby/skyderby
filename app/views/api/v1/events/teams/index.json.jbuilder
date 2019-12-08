json.array! @teams do |team|
  json.partial! 'api/v1/events/teams/team', team: team
end
