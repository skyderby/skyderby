json.key_format! camelize: :lower

tournament = @tournament
scoreboard = @scoreboard
editable = tournament.editable?
surprise = tournament.surprise? && !editable
rounds = scoreboard.rounds.to_a
ActiveRecord::Associations::Preloader.new(records: scoreboard.results.to_a, associations: :qualification_round).call
competitors = surprise ? [] : scoreboard.competitors.to_a
preload_competitors(competitors.map(&:__getobj__))
show_best = scoreboard.show_best_result?
best_leader = surprise ? nil : scoreboard.best_result_leader

json.surprise surprise
json.editable editable
json.scoring tournament.qualification_scoring
json.show_best_result show_best
json.podium !surprise && scoreboard.podium?
json.best_result_leader api_float(best_leader, 3)
json.rounds rounds do |round|
  leader = surprise ? nil : scoreboard.round_leader_result(round)
  json.id round.id
  json.order round.order
  json.label t('tournaments.qualifications.scoreboard.round', number: round.order)
  json.completed round.completed
  json.leader_result api_float(leader, 3)
end
json.rows competitors do |competitor|
  best = competitor.best_result

  json.rank competitor.rank
  json.ranked competitor.ranked?
  json.on_podium !surprise && scoreboard.podium? && competitor.ranked? && competitor.rank <= 3
  json.competitor_id competitor.id
  json.competitor { json.partial! 'api/v1/competitions/competitor', competitor: competitor.__getobj__ }
  json.is_disqualified competitor.is_disqualified || false
  json.disqualification_reason competitor.disqualification_reason
  json.best_result api_float(best, 3)
  json.formatted_best_result format_race_time(best)
  json.best_result_gap(best && best_leader ? (best - best_leader).to_f.round(3) : nil)
  json.top_speed api_float(competitor.top_speed, 1)

  results = competitor.results.select { |jump| jump.result.present? || editable }.sort_by { |jump| jump.round.order }
  json.results results do |jump|
    leader = scoreboard.round_leader_result(jump.round)
    positive = jump.result.to_f.positive?

    json.id jump.id
    json.round_id jump.qualification_round_id
    json.track_id jump.track_id
    json.result api_float(jump.result, 3)
    json.formatted_result format_race_time(jump.result)
    json.best competitor.best_result_in?(jump)
    json.gap_to_leader(!show_best && positive && leader ? (jump.result - leader).to_f.round(3) : nil)
    json.canopy_time api_float(jump.canopy_time, 1)
    json.formatted_canopy_time jump.canopy_time && format('%.1f', jump.canopy_time)
    json.canopy_low jump.canopy_time.present? && jump.canopy_time < 40
    json.top_speed api_float(jump.top_speed, 1)
    json.start_time jump.start_time&.utc&.iso8601(3)
  end
end
