module Tracks
  module SpeedsChart
    class ChartData
      def initialize(points, zerowind_points, speed_presenter)
        @points = points
        @zerowind_points = zerowind_points
        @speed_presenter = speed_presenter
        @min_gps_time = points.first&.fetch(:gps_time)
      end

      def ground_speed_chart_line
        points.map do |x|
          [(x[:gps_time] - min_gps_time).round(1), speed_presenter.call(x[:h_speed])]
        end.to_json
      end

      def vertical_speed_chart_line
        points.map do |x|
          [(x[:gps_time] - min_gps_time).round(1), speed_presenter.call(x[:v_speed])]
        end.to_json
      end

      def full_speed_chart_line
        points.map do |x|
          full_speed = Math.sqrt((x[:v_speed]**2) + (x[:h_speed]**2))
          [(x[:gps_time] - min_gps_time).round(1), speed_presenter.call(full_speed)]
        end.to_json
      end

      def wind_effect_speed_chart_line
        zerowind_points.zip(points).map do |zerowind_point, point|
          [
            (zerowind_point[:gps_time] - min_gps_time).round(1),
            speed_presenter.call(zerowind_point[:h_speed]),
            speed_presenter.call(point[:h_speed])
          ]
        end.to_json
      end

      private

      attr_reader :points, :zerowind_points, :speed_presenter, :min_gps_time
    end
  end
end
