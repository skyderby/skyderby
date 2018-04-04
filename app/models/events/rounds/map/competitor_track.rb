class Events::Rounds::Map::CompetitorTrack < SimpleDelegator
  NullWindowPoints = Struct.new(:start_point, :end_point, :direction)

  attr_accessor :color

  def name
    competitor.name
  end

  def start_time
    track.points.trimmed.first.gps_time
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
    map_marker(five_seconds_after_exit_point)
  end

  def direction
    window_points.direction
  end

  private

  def map_marker(point)
    { lat: point[:latitude].to_f, lng: point[:longitude].to_f }
  end

  def five_seconds_after_exit_point
    time_for_lookup = points.first[:gps_time] + 5.seconds
    points.find(points.first) { |point| point[:gps_time] > time_for_lookup }
  end

  def window_points
    @window_points ||= WindowRangeFinder.new(points).execute(
      from_altitude: round.range_from,
      to_altitude: round.range_to
    )
  rescue WindowRangeFinder::ValueOutOfRange
    Rails.logger.debug "Failed to get range data from track #{event_track.track_id}"
    NullWindowPoints.new(points.first, points.last)
  end

  def points
    @points ||= PointsQuery.execute(
      track,
      trimmed: true,
      only: %i[gps_time altitude latitude longitude]
    )
  end
end
