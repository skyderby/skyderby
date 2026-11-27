module Event::TrackPoints
  extend ActiveSupport::Concern

  NullWindowPoints = Struct.new(:start_point, :end_point, :direction)

  def window_points
    @window_points ||= WindowRangeFinder.new(points).execute(
      from_altitude: round.range_from,
      to_altitude: round.range_to
    )
  rescue WindowRangeFinder::ValueOutOfRange
    Rails.logger.debug { "Failed to get range data from track #{track_id}" }
    NullWindowPoints.new(points.first, points.last)
  end

  def points
    @points ||= track.flight_points(trimmed: { seconds_before_start: 7 })
  end
end
