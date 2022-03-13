module Events
  module Rounds
    class CompetitorResult < SimpleDelegator
      DL_STARTS_AFTER = 10.seconds
      NullWindowPoints = Struct.new(:start_point, :end_point, :direction)

      delegate :name, :assigned_number, to: :competitor
      delegate :direction, to: :window_points
      delegate :start_point, :end_point, to: :window_points

      def photo_url(...) = competitor.profile.userpic_url(...)

      def empty? = points.blank?

      def present? = !empty?

      def start_time = points.blank? ? track.recorded_at : points.first[:gps_time]

      def after_exit_point
        time_for_lookup = exited_at + DL_STARTS_AFTER
        points.find(-> { points.first }) { |point| point[:gps_time] > time_for_lookup }
      end
    end
  end
end
