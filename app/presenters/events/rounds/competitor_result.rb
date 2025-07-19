module Events
  module Rounds
    class CompetitorResult < SimpleDelegator
      NullWindowPoints = Struct.new(:start_point, :end_point, :direction)

      delegate :name, :assigned_number, to: :competitor
      delegate :direction, to: :window_points
      delegate :start_point, :end_point, to: :window_points

      def photo_url(...) = competitor.profile.userpic_url(...)

      def empty? = points.blank?

      def present? = !empty?

      def start_time = points.blank? ? track.recorded_at : points.first[:gps_time]

      def after_exit_point
        time_for_lookup = exited_at + dl_starts_after
        points.find(-> { points.first }) { |point| point[:gps_time] > time_for_lookup }
      end

      private

      def dl_starts_after
        return 10 if event.designated_lane_start_on_10_sec?
        return 9 if event.designated_lane_start_on_9_sec?

        0
      end
    end
  end
end
