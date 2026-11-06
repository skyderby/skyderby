class Track::FlightMetrics::Segments
  SHARES = [0.15, 0.35, 0.35, 0.15].freeze
  KMH = Track::FlightMetrics::KMH
  KEYS = %i[time lost along total].freeze

  def initialize(samples)
    @samples = samples
  end

  def to_a
    return [] if samples.size < 2

    boundaries.each_cons(2).map { |from, to| segment(from, to) }
  end

  def self.energy(kmh) = 0.5 * ((kmh / KMH)**2)

  private

  attr_reader :samples

  def boundaries
    height = samples.last[:lost]
    SHARES.each_with_object([0.0]) { |share, marks| marks << (marks.last + (height * share)) }.map { |lost| at(lost) }
  end

  def segment(from, to)
    delta = KEYS.index_with { |key| to[key] - from[key] }
    { 'from_lost' => from[:lost].round, 'to_lost' => to[:lost].round, **averages(delta),
      'total_speed_change' => delta[:total].round, 'energy_change' => energy_change(from, to) }
  end

  def averages(delta)
    seconds = [delta[:time], 0.1].max
    { 'time' => seconds.round(1), 'distance' => delta[:along].round, 'glide' => (delta[:along] / delta[:lost]).round(2),
      'avg_h_speed' => (delta[:along] / seconds * KMH).round, 'avg_v_speed' => (delta[:lost] / seconds * KMH).round }
  end

  def energy_change(from, to) = (self.class.energy(to[:total]) - self.class.energy(from[:total])).round

  def at(lost)
    index = along.index { |sample| sample[:lost] >= lost } || (along.size - 1)
    before = along[[index - 1, 0].max]
    after = along[index]
    span = after[:lost] - before[:lost]
    mix(before, after, span.positive? ? (lost - before[:lost]) / span : 0)
  end

  def mix(before, after, ratio) = KEYS.index_with { |key| before[key] + ((after[key] - before[key]) * ratio) }

  def along
    @along ||= begin
      distance = 0.0
      samples.each_with_index.map do |sample, index|
        distance += step(samples[[index - 1, 0].max], sample)
        sample.merge(along: distance, total: Math.hypot(sample[:h_speed], sample[:v_speed]))
      end
    end
  end

  def step(previous, sample) = (sample[:h_speed] + previous[:h_speed]) / 2 / KMH * (sample[:time] - previous[:time])
end
