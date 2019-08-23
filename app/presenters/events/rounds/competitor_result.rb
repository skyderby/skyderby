module Events
  module Rounds
    class CompetitorResult < SimpleDelegator
      DL_STARTS_AFTER = 10.seconds
      NullWindowPoints = Struct.new(:start_point, :end_point, :direction)

      delegate :name, to: :competitor
      delegate :direction, to: :window_points
      delegate :start_point, :end_point, to: :window_points

      def photo
        competitor.profile.userpic
      end

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

      def after_exit_point
        time_for_lookup = start_time + DL_STARTS_AFTER
        points.find(points.first) { |point| point[:gps_time] > time_for_lookup }
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
          trimmed: true,
          only: %i[gps_time altitude abs_altitude latitude longitude v_speed]
        )
      end
    end
  end
end
