class WindowRangeFinder
  class UnknownFilter   < StandardError; end

  class ValueOutOfRange < StandardError; end

  # Order matters
  ALLOWED_FILTERS = %i[
    from_altitude
    from_vertical_speed
    from_gps_time
    duration
    elevation
    elevation_with_breakoff
    to_altitude
    until_cross_finish_line
  ].freeze

  def initialize(points)
    @points = points
  end

  def execute(args)
    args.each { |filter, _| raise UnknownFilter, filter unless ALLOWED_FILTERS.include? filter }

    ALLOWED_FILTERS.each do |filter|
      send(filter, args[filter]) if args.key? filter
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

    interpolated_point = PointInterpolation.new(
      points[index - 1],
      points[index]
    ).execute(by: :altitude, with_value: altitude)

    @points = [interpolated_point] + points[index..]
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

    interpolated_point = PointInterpolation.new(
      points[index - 1],
      points[index]
    ).execute(by: :v_speed, with_value: speed)

    @points = [interpolated_point] + points[index..]
  end

  def from_gps_time(gps_time)
    index = points.index { |x| x[:gps_time] >= gps_time }

    raise ValueOutOfRange if index.nil?

    needs_interpolation = points[index][:gps_time] != gps_time

    # raise if previous point is missed
    # i.e. current is first and iterpolation needed
    raise ValueOutOfRange if index.zero? && needs_interpolation

    interpolated_point = PointInterpolation.new(
      points[index - 1],
      points[index]
    ).execute(by: :gps_time, with_value: gps_time)

    @points = [interpolated_point] + points[index..]
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

    to_altitude(lookup_altitude)
  end

  def elevation_with_breakoff(options)
    altitude = options[:altitude]
    breakoff = options[:breakoff]

    lookup_altitude = [breakoff, points.first[:altitude] - altitude].max

    to_altitude(lookup_altitude)
  end

  def until_cross_finish_line(finish_line)
    intersection_point = PathIntersectionFinder.new(
      points,
      finish_line
    ).execute

    index = points.reverse.index { |x| x[:gps_time] < intersection_point[:gps_time] }

    @points = points[0..index] + [intersection_point]
  end
end
