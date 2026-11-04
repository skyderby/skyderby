json.key_format! camelize: :lower

competition = @roster.competition

json.items @roster.participants do |participant|
  standing = @roster.standing_for(participant)

  json.id participant.id
  json.admin participant.admin
  json.tracks_scanned participant.tracks_scanned?
  json.profile { json.partial! 'api/v1/virtual_competitions/profile', profile: participant.profile }
  json.rank standing&.rank
  json.formatted_result(
    standing ? "#{format_result(standing.result, competition)} #{competition_unit(competition)}" : nil
  )
  json.tracks_count @roster.scored_tracks_count(participant)
end
