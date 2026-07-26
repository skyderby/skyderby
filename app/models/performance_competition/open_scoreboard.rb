class PerformanceCompetition::OpenScoreboard
  include PerformanceCompetition::TimeMachineable

  attr_reader :event, :until_round, :apply_penalty_to_score, :wind_cancellation

  # @param until_round [Integer, nil] 1-based position in the completion timeline to display up to
  def initialize(event, until_round: nil, wind_cancellation: false)
    @event = event
    @apply_penalty_to_score = event.apply_penalty_to_score
    @until_round = until_round
    @wind_cancellation = wind_cancellation
  end

  def columns_count
    @columns_count ||= rounds.count * 2 + rounds_by_discipline.count + 4
  end

  def standings
    previous_standings = PerformanceCompetition::Scoreboard::Standings.new(
      competitors,
      completed_rounds[0...-1],
      results,
      apply_penalty_to_score:,
      wind_cancellation:
    )

    PerformanceCompetition::Scoreboard::Standings.new(
      competitors,
      completed_rounds,
      results,
      previous_standings,
      apply_penalty_to_score:,
      wind_cancellation:
    )
  end

  def competitors
    @competitors ||= event.competitors.includes(profile: :country, suit: :manufacturer)
  end

  def rounds = event.rounds.ordered

  def rounds_by_discipline
    @rounds_by_discipline ||= rounds.group_by(&:discipline)
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end
