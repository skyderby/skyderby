class PerformanceCompetitionSeries::Scoreboard::Standings::Result
  attr_reader :record, :points, :best_result

  delegate :round, :competitor, :penalized, :penalty_size, :penalty_reason, to: :record
  delegate :display_raw_results, to: :settings

  def initialize(record, settings)
    @record = record
    @settings = settings
    @best_result = false
  end

  def formatted_result
    return '' if result.zero? && !penalized

    if round.distance?
      format('%d', result.truncate)
    else
      format('%.1f', result)
    end
  end

  def formatted_points
    return '' if result.zero? && !penalized

    format('%.1f', points.to_f.round(1))
  end

  def result
    value = record.public_send(result_field)
    return 0 unless value

    (value - value / 100 * penalty_size.to_f).round(precision)
  end

  def calculate_points_from(best_result)
    return if result.zero? || best_result.zero?

    @points = result.to_d / best_result * 100
  end

  def best_result! = @best_result = true

  private

  def result_field = display_raw_results ? :result : :result_net

  def precision = round.distance? ? 0 : 1

  attr_reader :settings
end
