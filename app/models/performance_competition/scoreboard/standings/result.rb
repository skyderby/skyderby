class PerformanceCompetition::Scoreboard::Standings::Result < SimpleDelegator
  attr_reader :record, :points, :best_result, :wind_cancellation, :round_best_result

  def initialize(record, wind_cancellation: false)
    @record = record
    @wind_cancellation = wind_cancellation
    @best_result = false

    super(record)
  end

  def valid? = result.positive? || penalized?

  def formatted_result
    return '' unless valid?

    if round.distance?
      format('%d', result)
    else
      format('%.1f', result)
    end
  end

  def result
    calculated_result = wind_cancellation ? record.result_net : record.result
    return 0 unless calculated_result

    if record.event.apply_penalty_to_score
      calculated_result.then { |result| round.distance? ? result.round : result.round(1) }
    else
      (calculated_result - (calculated_result / 100 * penalty_size.to_f))
        .then { |result| round.distance? ? result.round : result.round(1) }
    end
  end

  def calculate_points_from(best_result)
    return if result.zero? || best_result.zero?

    @round_best_result = best_result

    @points = result.to_d / best_result * 100

    @points -= (@points / 100 * penalty_size.to_f) if record.event.apply_penalty_to_score
  end

  def gap_to_best
    return unless round_best_result

    (result - round_best_result).then { |gap| round.distance? ? gap.round : gap.round(1) }
  end

  def best_result! = @best_result = true

  def best_result? = @best_result

  def penalty_size
    penalized ? super : 0
  end
end
