class SpeedSkydivingCompetition::OpenScoreboard
  Category = Struct.new(:id)

  attr_reader :event

  delegate :competitors, :rounds, :results, to: :event

  def initialize(event)
    @event = event
  end

  def standings
    SpeedSkydivingCompetition::Scoreboard::Standings.build(
      competitors,
      rounds,
      results
    )
  end
end
