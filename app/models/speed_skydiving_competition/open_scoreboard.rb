class SpeedSkydivingCompetition::OpenScoreboard
  attr_reader :event, :until_round

  delegate :competitors, to: :event

  def initialize(event, until_round: nil)
    @event = event
    @until_round = until_round
  end

  def rows
    SpeedSkydivingCompetition::Scoreboard::Standings.build(
      competitors,
      completed_rounds,
      results
    )
  end

  def completed_rounds
    @completed_rounds ||=
      if until_round
        rounds.completed.where(number: ..until_round)
      else
        rounds.completed
      end
  end

  def rounds = event.rounds.ordered

  private

  def results
    event.results.includes(:competitor, :round, :penalties)
  end
end
