json.key_format! camelize: :lower

tournament = @tournament
editable = tournament.editable?
finish_line = tournament.finish_line
competitors = preload_competitors(tournament.competitors)

json.partial! 'api/v1/competitions/event',
              event: tournament, status: tournament.draft? ? 'published' : tournament.status
json.discipline tournament.discipline
json.bracket_size tournament.bracket_size
json.has_qualification tournament.has_qualification
json.qualification_scoring tournament.qualification_scoring

if finish_line
  json.finish_line do
    json.id finish_line.id
    json.name finish_line.name
    json.start do
      json.latitude api_float(finish_line.start_latitude)
      json.longitude api_float(finish_line.start_longitude)
    end
    json.end do
      json.latitude api_float(finish_line.end_latitude)
      json.longitude api_float(finish_line.end_longitude)
    end
  end
else
  json.finish_line nil
end

json.boards do
  if tournament.rounds.exists? || editable
    json.child! do
      json.key 'bracket'
      json.label t('events.scoreboard')
      json.path api_v1_tournament_bracket_path(tournament)
    end
  end
  if tournament.has_qualification
    json.child! do
      json.key 'qualification'
      json.label t('tournaments.qualifications.round')
      json.path api_v1_tournament_qualification_path(tournament)
    end
  end
end

json.rounds tournament.qualification_rounds.sort_by(&:order) do |round|
  json.id round.id
  json.number round.order
  json.label t('tournaments.qualifications.scoreboard.round', number: round.order)
  json.completed round.completed
end

json.competitors competitors do |competitor|
  json.partial! 'api/v1/competitions/competitor', competitor: competitor
  json.is_disqualified competitor.is_disqualified || false
  json.disqualification_reason competitor.disqualification_reason
  json.sponsor_logo_url stored_file_url(competitor.sponsor_logo_url(:medium))
end

json.partial! 'api/v1/competitions/organizers_and_sponsors', organizable: tournament
