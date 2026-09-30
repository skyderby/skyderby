class Track::HeadUpCheck
  CANOPY_SETTLE_TIME = 15
  CANOPY_SAMPLE_DURATION = 60
  MIN_SPECIFIC_FORCE = 0.5
  MAX_ANGLE = 70

  def initialize(track)
    @track = track
  end

  def head_up_range?(range) = head_up_between?(range[:start_point][:gps_time], range[:end_point][:gps_time])

  def head_up_between?(from, to)
    angle = angle_between(from, to)
    angle.present? && angle <= MAX_ANGLE
  end

  def angle_between(from, to)
    vectors = vectors_between(from, to)
    return if reference.nil? || vectors.empty?

    mean = normalize(vectors.transpose.map(&:sum))
    Math.acos(dot(mean, reference).clamp(-1.0, 1.0)) * 180 / Math::PI
  end

  private

  attr_reader :track

  def reference
    return @reference if defined?(@reference)

    vectors = vectors_between(canopy_start, canopy_end)
    @reference = vectors.empty? ? nil : normalize(vectors.transpose.map(&:sum))
  end

  def canopy_start = track.deployed_at && (track.deployed_at + CANOPY_SETTLE_TIME)

  def canopy_end
    return unless canopy_start

    [canopy_start + CANOPY_SAMPLE_DURATION, track.landed_at].compact.min
  end

  def vectors_between(from, to)
    return [] unless from && to

    samples[first_index_from(from)...first_index_after(to)]
      .map(&:vector)
      .select { |vector| norm(vector) >= MIN_SPECIFIC_FORCE }
  end

  def first_index_from(time)
    samples.bsearch_index { |sample| sample.gps_time >= time.to_f } || samples.size
  end

  def first_index_after(time)
    samples.bsearch_index { |sample| sample.gps_time > time.to_f } || samples.size
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
