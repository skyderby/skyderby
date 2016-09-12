class WindowRangeFinder
  class UnknownFilter   < StandardError; end
  class ValueOutOfRange < StandardError; end

  # Order matters
  ALLOWED_FILTERS = [:from_altitude,
                     :from_vertical_speed,
                     :duration,
                     :elevation,
                     :to_altitude]

  def initialize(points)
    @points = points
  end

  def execute(args)
    args.each { |filter, _| raise UnknownFilter, filter unless ALLOWED_FILTERS.include? filter }

    ALLOWED_FILTERS.each do |filter|
      send(filter, args[filter]) if args.has_key? filter
    end

    TrackSegment.new(points)
  end

  private

  attr_reader :points

  def from_altitude(altitude)
    index = points.index { |x| x[:altitude] <= altitude }

    raise ValueOutOfRange if index.nil?
    needs_interpolation = points[index][:altitude] != altitude

    # raise if previous point is missed 
    # i.e. current is first and iterpolation needed
    raise ValueOutOfRange if index.zero? && needs_interpolation

    return unless needs_interpolation

    interpolated_point = PointInterpolation.new(
      points[index - 1],
      points[index]
    ).execute(by: :altitude, with_value: altitude)

    @points = [interpolated_point] + points[index..-1]
  end

  def to_altitude(altitude)
    index = points.index { |x| x[:altitude] <= altitude }

    raise ValueOutOfRange if index.nil? || index.zero?

    interpolated_point = PointInterpolation.new(
      points[index - 1],
      points[index]
    ).execute(by: :altitude, with_value: altitude)

    @points = points[0..(index - 1)] + [interpolated_point]
  end

  def from_vertical_speed(speed)
    index = points.index { |x| x[:v_speed] >= speed }

    raise ValueOutOfRange if index.nil?
    needs_interpolation = points[index][:v_speed] != speed

    # raise if previous point is missed 
    # i.e. current is first and iterpolation needed
    raise ValueOutOfRange if index.zero? && needs_interpolation

    return unless needs_interpolation

    interpolated_point = PointInterpolation.new(
      points[index - 1],
      points[index]
    ).execute(by: :v_speed, with_value: speed)

    @points = [interpolated_point] + points[index..-1]
  end

  def duration(time)
    lookup_time = points.first[:gps_time] + time.seconds
    
    index = points.index { |x| x[:gps_time] >= lookup_time }

    raise ValueOutOfRange if index.nil? || index.zero?

    interpolated_point = PointInterpolation.new(
      points[index - 1],
      points[index]
    ).execute(by: :gps_time, with_value: lookup_time)

    @points = points[0..(index - 1)] + [interpolated_point]
  end

  def elevation(altitude)
    lookup_altitude = points.first[:altitude] - altitude

    index = points.index { |x| x[:altitude] <= lookup_altitude }

    raise ValueOutOfRange if index.nil? || index.zero?

    interpolated_point = PointInterpolation.new(
      points[index - 1],
      points[index]
    ).execute(by: :altitude, with_value: lookup_altitude)

    @points = points[0..(index - 1)] + [interpolated_point]
  end
end
