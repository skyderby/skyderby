require 'vincenty'

class TrackSegment
  attr_reader :points, :start_point, :end_point

  delegate :size, to: :points

  def initialize(points)
    @points = points
    @start_point = points.first
    @end_point = points.last
  end

  def start_altitude
    start_point[:altitude]
  end

  def end_altitude
    end_point[:altitude]
  end

  def distance
    return 0 if start_point.blank? || end_point.blank?
    Vincenty.distance_between_points(start_point, end_point)
  end
  alias_method :straight_line_distance, :distance

  def direction
    Skyderby::Geospatial.bearing_between(
      start_point[:latitude], start_point[:longitude],
      end_point[:latitude],   end_point[:longitude])
  end

  def speed
    distance / time.to_f * 3.6
  end

  def time
    (end_point[:gps_time] - start_point[:gps_time]).abs
  end

  def max_gr
    gr_treshold_in_kmh = 50
    point = @points.max_by { |x| x[:h_speed] > gr_treshold_in_kmh ? x[:glide_ratio] : 0 }
    point[:glide_ratio]
  end

  def max_ground_speed
    point = @points.max_by { |x| x[:h_speed] }
    point[:h_speed]
  end
end
