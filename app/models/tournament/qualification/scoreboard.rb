class Tournament::Qualification::Scoreboard
  def initialize(tournament)
    @tournament = tournament
  end

  def rounds
    @rounds ||= tournament.qualification_rounds.order(:order)
  end

  def show_best_result?
    tournament.scoring_best_result?
  end

  def completed_rounds_desc
    @completed_rounds_desc ||= rounds.select(&:completed?).reverse
  end

  def competitors
    @competitors ||=
      Tournament::Qualification::CompetitorsCollection.new(
        tournament.competitors.includes(profile: :country, suit: :manufacturer), self
      )
  end

  def results
    @results ||= tournament.qualification_jumps.all
  end

  def results_by_competitor
    @results_by_competitor ||= results.group_by(&:competitor_id)
  end

  def head_to_head_replays
    @head_to_head_replays ||=
      head_to_head_pairs.filter_map do |entry_a, entry_b|
        Tournaments::QualificationReplay.new(tournament, entry_a, entry_b).presence
      end
  end

  private

  attr_reader :tournament

  def ranked_competitors
    @ranked_competitors ||= competitors.select(&:ranked?)
  end

  # Pools of competitors to compare head-to-head, covering everyone once.
  # Best-result scoring compares best jumps across the whole field; last-round
  # scoring compares each round's field, and for earlier rounds only those who
  # did not advance (eliminated after that round).
  def head_to_head_pools
    return [[nil, ranked_competitors]] if show_best_result?

    seen = Set.new
    completed_rounds_desc.filter_map do |round|
      pool = competitors_in_round(round).reject { |competitor| seen.include?(competitor.id) }
      next if pool.empty?

      pool.each { |competitor| seen << competitor.id }
      [round, pool]
    end
  end

  # Adjacent-by-standing pairs of [competitor, jump] entries. An odd competitor
  # borrows the nearest-ranked neighbour (from the previous pool when the pool
  # itself has a single member) so everyone ends up on screen.
  def head_to_head_pairs
    previous_entry = nil

    head_to_head_pools.flat_map do |round, competitors|
      entries = competitors.map { |competitor| [competitor, jump_for(competitor, round)] }
      pairs = pair_entries(entries, previous_entry)
      previous_entry = entries.last || previous_entry
      pairs
    end
  end

  def pair_entries(entries, previous_entry)
    grouped = entries.each_slice(2).to_a
    return grouped unless grouped.last&.one?

    leftover = grouped.pop.first
    partner = entries[-2] || previous_entry
    partner ? grouped << [partner, leftover] : grouped
  end

  def competitors_in_round(round)
    ranked_competitors
      .select { |competitor| round_jump(competitor, round) }
      .sort_by { |competitor| [round_jump(competitor, round).result, competitor.name.to_s] }
  end

  def jump_for(competitor, round)
    round ? round_jump(competitor, round) : competitor.best_jump
  end

  def round_jump(competitor, round)
    jump = competitor.result_in_round(round)
    jump if jump&.result&.positive?
  end
end
