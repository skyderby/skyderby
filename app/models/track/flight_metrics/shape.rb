class Track::FlightMetrics::Shape
  PARTS = 3

  def initialize(samples)
    @samples = samples
  end

  def to_h
    return {} if samples.size < PARTS

    {
      'thirds' => {
        'v_speed' => average_by_third(:v_speed),
        'h_speed' => average_by_third(:h_speed),
        'glide' => thirds.map { |part| glide(part) }
      },
      'v_speed_spread' => spread(samples.pluck(:v_speed)).round(1)
    }
  end

  private

  attr_reader :samples

  def thirds
    @thirds ||= begin
      duration = [samples.last[:time], 0.1].max
      samples.group_by { |sample| [(sample[:time] / duration * PARTS).floor, PARTS - 1].min }.sort.map(&:last)
    end
  end

  def average_by_third(key) = thirds.map { |part| (part.sum { |sample| sample[key] } / part.size).round }

  def glide(part)
    v_speed = part.sum { |sample| sample[:v_speed] }
    v_speed.positive? ? (part.sum { |sample| sample[:h_speed] } / v_speed).round(2) : 0
  end

  def spread(values)
    mean = values.sum / values.size
    Math.sqrt(values.sum { |value| (value - mean)**2 } / values.size)
  end
end
