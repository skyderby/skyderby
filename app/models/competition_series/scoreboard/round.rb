class CompetitionSeries::Scoreboard::Round
  attr_reader :discipline, :number

  def initialize(discipline, number)
    @discipline = discipline
    @number = number
  end

  def includes?(other)
    discipline == other.discipline &&
      number == other.number
  end
end
