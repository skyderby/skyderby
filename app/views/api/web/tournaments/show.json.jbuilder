json.partial! 'tournament', tournament: @tournament

json.competitors @tournament.competitors.sort_by { _1.profile.name } do |competitor|
  json.partial! 'api/web/tournaments/competitors/competitor', competitor: competitor
end

json.rounds @tournament.rounds.sort_by(&:order) do |round|
  json.partial! 'api/web/tournaments/rounds/round', round: round
  json.brackets round.matches do |match|
    json.partial! 'api/web/tournaments/rounds/matches/match', match: match
    json.slots match.slots do |slot|
      json.partial! 'api/web/tournaments/rounds/matches/slots/slot', slot: slot
    end
  end
end
