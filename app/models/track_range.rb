class TrackRange
  def initialize(track, opts = {})
    @track = track
    @opts = opts
  end

  def from
    from_param = convert_from_string(opts[:from])
    @from ||= if from_param && from_param < max_altitude
                from_param
              else
                max_altitude
              end
  end

  def to
    to_param = convert_from_string(opts[:to])
    @to ||= if to_param && to_param > min_altitude && to_param < from
              to_param
            else
              min_altitude
            end
  end

  private

  attr_reader :track, :opts

  def max_altitude = track.altitude_bounds[:max_altitude]

  def min_altitude = track.altitude_bounds[:min_altitude]

  def convert_from_string(value) = value.presence&.to_f
end
