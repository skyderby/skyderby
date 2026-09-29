json.key_format! camelize: :lower

tournament = @tournament
editable = tournament.editable?
surprise = tournament.surprise? && !editable
rounds = surprise ? [] : tournament.rounds.order(:order).includes(matches: :slots).to_a
slots = rounds.flat_map { |round| round.matches.flat_map(&:slots) }
ActiveRecord::Associations::Preloader.new(records: slots, associations: :competitor).call
preload_competitors(slots.filter_map(&:competitor).uniq, suit: :manufacturer)

json.surprise surprise
json.editable editable
json.bracket_size tournament.bracket_size
json.rounds rounds.each_with_index.to_a do |round, index|
  next_round = rounds[index + 1]
  final = round.final?
  matches = final ? round.matches.sort_by(&:match_type_before_type_cast) : round.matches.to_a
  stage = tournament_stage_key(round.order, rounds.size)

  json.id round.id
  json.order round.order
  json.label tournament_round_label(round.order)
  json.stage stage
  json.stage_label tournament_stage_name(round.order, rounds.size)
  json.final final
  json.connector(
    if next_round.nil? then 'none'
    elsif next_round.final? || next_round.matches.size < round.matches.size then 'reduce'
    else 'straight'
    end
  )
  json.matches matches.each_with_index.to_a do |match, match_index|
    json.id match.id
    json.position match.position
    json.match_type match.match_type
    json.label tournament_match_label(match, match_index + 1, round.order, rounds.size)
    json.start_time match.start_time&.utc&.iso8601(3)
    json.free_slots match.free_slots
    json.slots match.slots do |slot|
      json.id slot.id
      json.competitor_id slot.competitor_id
      if slot.competitor
        json.competitor { json.partial! 'api/v1/competitions/competitor', competitor: slot.competitor }
      else
        json.competitor nil
      end
      json.result api_float(slot.result, 3)
      json.formatted_result format_race_time(slot.result)
      json.is_winner slot.is_winner || false
      json.is_disqualified slot.is_disqualified || false
      json.is_lucky_looser slot.is_lucky_looser || false
      json.earn_medal slot.earn_medal
      json.notes slot.notes
      json.track_id slot.track_id
    end
  end
end
