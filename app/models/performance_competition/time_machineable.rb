module PerformanceCompetition::TimeMachineable
  def time_machine? = !until_round.nil?

  def timeline_rounds
    @timeline_rounds ||=
      rounds
      .select(&:completed)
      .sort_by { |round| [round.completed_at, round.number, round.created_at, round.id] }
  end

  def timeline_positions
    @timeline_positions ||= timeline_rounds.each_with_index.to_h { |round, index| [round, index + 1] }
  end

  def timeline_position(round) = timeline_positions[round]

  def completed_rounds
    @completed_rounds ||=
      if until_round.nil?
        timeline_rounds
      else
        timeline_rounds.first(until_round.clamp(0, timeline_rounds.size))
      end
  end
end
