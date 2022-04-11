class Event::Result < ApplicationRecord
  module TrackPoints
    extend ActiveSupport::Concern

    NullWindowPoints = Struct.new(:start_point, :end_point, :direction)

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
        only: %i[gps_time altitude abs_altitude latitude longitude v_speed glide_ratio]
      )
    end
  end
end
