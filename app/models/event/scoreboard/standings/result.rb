class Event::Scoreboard::Standings::Result < SimpleDelegator
  attr_reader :record, :points, :best_result, :wind_cancellation

  def initialize(record, wind_cancellation: false)
    @record = record
    @wind_cancellation = wind_cancellation
    @best_result = false

    super(record)
  end

  def valid? = result.positive? || penalized?

  def result
    calculated_result = wind_cancellation ? record.result_net : record.result
    return 0 unless calculated_result

    (calculated_result - (calculated_result / 100 * penalty_size.to_f))
      .then { |result| round.distance? ? result.truncate : result }
  end

  def calculate_points_from(best_result)
    return if result.zero? || best_result.zero?

    @points = result.to_d / best_result * 100
  end

  def best_result! = @best_result = true

  def best_result? = @best_result
end
