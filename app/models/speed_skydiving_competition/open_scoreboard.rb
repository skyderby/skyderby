class SpeedSkydivingCompetition::OpenScoreboard
  attr_reader :event

  delegate :competitors, to: :event

  def initialize(event)
    @event = event
  end

  def rows
    SpeedSkydivingCompetition::Scoreboard::Standings.build(
      competitors,
      completed_rounds,
      results
    )
  end

  def completed_rounds = event.rounds.select(&:completed?)

  def rounds = event.rounds.ordered

  private

  def results
    event.results.includes(:competitor, :round, :penalties)
  end
end
