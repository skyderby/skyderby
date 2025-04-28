class PerformanceCompetition::TaskScoreboard < PerformanceCompetition::OpenScoreboard
  attr_reader :discipline

  def initialize(event, task, params)
    super(event, params)
    @discipline = task
  end

  def rounds
    @rounds ||= super.select { |round| round.discipline == discipline }
  end
end
