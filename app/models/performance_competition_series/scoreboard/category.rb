class PerformanceCompetitionSeries::Scoreboard::Category
  attr_reader :name, :standings

  def initialize(name, standings)
    @name = name
    @standings = standings
  end
end
