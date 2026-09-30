class Track::HeadUpCheck
  CANOPY_SETTLE_TIME = 15
  CANOPY_SAMPLE_DURATION = 60
  MIN_SPECIFIC_FORCE = 0.5
  MAX_DEVIATION_ANGLE = 90
  MIN_HEAD_UP_FRACTION = 0.9

  def initialize(track)
    @track = track
  end

  def passed? = head_up_fraction >= MIN_HEAD_UP_FRACTION

  def head_up_fraction
    return 0.0 if reference.nil? || freefall_vectors.empty?

    freefall_vectors.count { |vector| head_up?(vector) }.fdiv(freefall_vectors.size)
  end

  private

  attr_reader :track

  def head_up?(vector)
    dot(vector, reference) / norm(vector) >= Math.cos(MAX_DEVIATION_ANGLE * Math::PI / 180)
  end

  def reference
    return @reference if defined?(@reference)

    vectors = vectors_between(canopy_start, canopy_end)
    @reference = vectors.empty? ? nil : normalize(vectors.transpose.map(&:sum))
  end

  def freefall_vectors
    @freefall_vectors ||= vectors_between(track.exited_at, track.speed_skydiving_result.window_end_time)
  end

  def canopy_start = track.deployed_at && (track.deployed_at + CANOPY_SETTLE_TIME)

  def canopy_end
    return unless canopy_start

    [canopy_start + CANOPY_SAMPLE_DURATION, track.landed_at].compact.min
  end

  def vectors_between(from, to)
    return [] unless from && to

    range = from.to_f..to.to_f
    samples
      .select { |sample| range.cover?(sample.gps_time) }
      .map(&:vector)
      .select { |vector| norm(vector) >= MIN_SPECIFIC_FORCE }
  end

  def samples
    @samples ||=
      if sensor_file&.attached?
        SensorParser::Flysight2.new(StringIO.new(sensor_file.download)).samples
      else
        []
      end
  end

  def sensor_file = track.track_file&.sensor_file

  def dot(left, right) = left.zip(right).sum { |x, y| x * y }

  def norm(vector) = Math.sqrt(dot(vector, vector))

  def normalize(vector)
    length = norm(vector)
    vector.map { |value| value / length }
  end
end
