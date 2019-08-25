class Events::Maps::CompetitorTrack < SimpleDelegator
  NullWindowPoints = Struct.new(:start_point, :end_point, :direction)

  attr_accessor :color

  delegate :name, to: :competitor
  delegate :direction, to: :window_points
  delegate :designated_lane_start, to: :event

  def empty?
    points.blank?
  end

  def present?
    !empty?
  end

  def start_time
    return track.recorded_at if points.blank?

    points.first[:gps_time]
  end

  def path_coordinates
    points.map { |point| map_marker(point) }
  end

  def start_point
    map_marker(window_points.start_point)
  end

  def end_point
    map_marker(window_points.end_point)
  end

  def after_exit_point
    map_marker(ten_seconds_after_exit_point)
  end

  def reference_point
    assigned_point = super
    return unless assigned_point

    map_marker(assigned_point)
  end

  private

  def map_marker(point)
    { lat: point[:latitude].to_f, lng: point[:longitude].to_f }
  end

  def ten_seconds_after_exit_point
    time_for_lookup = exit_time + 10.seconds
    points.find(points.first) { |point| point[:gps_time] > time_for_lookup }
  end

  def exit_time
    gr_threshold = 10

    points
      .each_cons(15).find([points.first]) do |range|
        range.all? { |point| point[:glide_ratio] < gr_threshold }
      end
      .first[:gps_time]
  end

  def window_points
    @window_points ||= WindowRangeFinder.new(points).execute(
      from_altitude: round.range_from,
      to_altitude: round.range_to
    )
  rescue WindowRangeFinder::ValueOutOfRange
    Rails.logger.debug "Failed to get range data from track #{track_id}"
    NullWindowPoints.new(points.first, points.last)
  end

  def points
    @points ||= PointsQuery.execute(
      track,
      trimmed: { seconds_before_start: 7 },
      only: %i[gps_time altitude latitude longitude glide_ratio]
    )
  end
end
