class PathIntersectionFinder
  class IntersectionNotFound < StandardError; end

  def initialize(track_points, finish_line)
    @track_points = track_points
    @finish_segment = flight_segment_in_mercator(finish_line)
  end

  def execute
    intersected_segment =
      track_points.each_cons(2).detect do |pair|
        segment = flight_segment_in_mercator(pair)
        segment.intersects_with? finish_segment
      end

    raise IntersectionNotFound unless intersected_segment

    segment = flight_segment_in_mercator(intersected_segment)
    intersection_point = segment.intersection_point_with(finish_segment)

    hash_point = Skyderby::Geospatial.mercator_to_coordinates(
      intersection_point.x,
      intersection_point.y
    )

    interpolate_by_field = interpolation_field(intersected_segment)
    PointInterpolation.new(intersected_segment.first, intersected_segment.last).execute(
      by: interpolate_by_field,
      with_value: hash_point[interpolate_by_field]
    )
  end

  private

  attr_reader :track_points, :finish_segment

  def flight_segment_in_mercator(pair)
    mercator_start = Skyderby::Geospatial.coordinates_to_mercator(
      pair.first[:latitude],
      pair.first[:longitude]
    )

    mercator_end = Skyderby::Geospatial.coordinates_to_mercator(
      pair.last[:latitude],
      pair.last[:longitude]
    )

    Geometry::Segment.new_by_arrays(
      [mercator_start[:x], mercator_start[:y]],
      [mercator_end[:x],   mercator_end[:y]]
    )
  end

  def interpolation_field(segment)
    interpolate_by_latitude?(segment) ? :latitude : :longitude
  end

  def interpolate_by_latitude?(segment)
    (segment.first[:latitude] - segment.last[:latitude]).abs >
      (segment.first[:longitude] - segment.last[:longitude]).abs
  end
end
