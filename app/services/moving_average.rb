class MovingAverage
  def initialize(values, window_size:)
    raise ArgumentError, 'Step must be odd and higher than 2' if window_size < 3 || window_size.even?

    @values = values
    @window_size = window_size
  end

  def execute
    neighbors = window_size / 2
    last = values.size - 1

    values.dup.tap do |averaged|
      averaged.each_index do |index|
        window = ((index - neighbors)..(index + neighbors)).map { |position| position.clamp(0, last) }
        averaged[index] = window.sum { |position| averaged[position] } / window_size
      end
    end
  end

  private

  attr_reader :values, :window_size
end
