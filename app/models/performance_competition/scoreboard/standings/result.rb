class PerformanceCompetition::Scoreboard::Standings::Result
  attr_reader :record, :points, :best_result

  delegate :id, :round, :competitor, :penalized, :penalty_size, :penalty_reason, to: :record

  def initialize(record)
    @record = record
    @best_result = false
  end

  def result
    return 0 unless record.result

    (record.result - (record.result / 100 * penalty_size.to_f))
      .round(round.distance? ? 0 : 1)
  end

  def calculate_points_from(best_result)
    return if result.zero? || best_result.zero?

    @points = result.to_d / best_result * 100
  end

  def best_result! = @best_result = true
end
