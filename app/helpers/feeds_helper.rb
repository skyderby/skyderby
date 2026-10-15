module FeedsHelper
  RESULT_PRECISION = { points: 1, kmh: 2, seconds: 3 }.freeze

  def feed_result_value(standing)
    number_with_precision(standing.total, precision: RESULT_PRECISION.fetch(standing.unit, 1))
  end
end
