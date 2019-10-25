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

      def exit_altitude
        exit_point[:altitude]
      end

      def after_exit_point
        time_for_lookup = exit_time + DL_STARTS_AFTER
        points.find(points.first) { |point| point[:gps_time] > time_for_lookup }
      end

      def exit_time
        exit_point[:gps_time]
      end

      def exit_point
        gr_threshold = 10

        points
          .each_cons(15).find([points.first]) do |range|
          range.all? { |point| point[:glide_ratio] < gr_threshold }
        end
          .first
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
          only: %i[gps_time altitude abs_altitude latitude longitude v_speed glide_ratio]
        )
      end
    end
  end
end
