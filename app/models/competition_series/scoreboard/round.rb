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

  def slug
    "#{discipline}-#{number}"
  end

  def included? = !excluded?

  def excluded? = @excluded || false

  def excluded! = @excluded = true
end
