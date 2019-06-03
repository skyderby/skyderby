module Tracks
  module GlideRatioChart
    class ChartData
      def initialize(points, zerowind_points, presenter)
        @points = points
        @zerowind_points = zerowind_points
        @presenter = presenter
        @min_gps_time = points.first&.fetch(:gps_time)
      end

      def glide_ratio_chart_line
        points.map do |x|
          {
            'x' => (x[:gps_time] - min_gps_time).round(1),
            'y' => y_for_glide_ratio(x[:glide_ratio]),
            'true_value' => presenter.call(x[:glide_ratio])
          }
        end.to_json.html_safe # rubocop:disable Rails/OutputSafety
      end

      def wind_effect_glide_ratio_chart_line
        zerowind_points.zip(points).map do |zerowind_point, point|
          {
            'x' => (point[:gps_time] - min_gps_time).round(1),
            'low' => y_for_glide_ratio(zerowind_point[:glide_ratio]),
            'high' => y_for_glide_ratio(point[:glide_ratio]),
            'true_value' => presenter.call(zerowind_point[:glide_ratio])
          }
        end.to_json.html_safe # rubocop:disable Rails/OutputSafety
      end

      private

      attr_reader :points, :zerowind_points, :min_gps_time, :presenter

      def y_for_glide_ratio(value)
        if value.negative?
          0
        elsif value > 7
          7
        else
          value.round(2)
        end
      end
    end
  end
end
