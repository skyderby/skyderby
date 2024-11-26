class SpeedSkydivingCompetition::OpenScoreboard
  Category = Struct.new(:id)

  attr_reader :event

  delegate :competitors, to: :event

  def initialize(event)
    @event = event
  end

  def standings
    SpeedSkydivingCompetition::Scoreboard::Standings.build(
      competitors,
      completed_rounds,
      results
    )
  end

  private

  def completed_rounds
    event.rounds.completed
  end

  def results
    event.results.includes(:competitor, :round, :penalties)
  end
end
