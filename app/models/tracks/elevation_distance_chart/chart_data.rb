module Tracks
  module ElevationDistanceChart
    class ChartData
      def initialize(points, altitude_presenter, distance_presenter)
        @points = points
        @altitude_presenter = altitude_presenter
        @distance_presenter = distance_presenter
        @min_gps_time = points.first&.fetch(:gps_time)
      end

      def altitude_chart_line
        points.map do |x|
          [(x[:gps_time] - min_gps_time).round(1), altitude_presenter.call(x[:altitude])]
        end.to_json
      end

      def elevation_chart_line
        return [] if points.blank?

        max_altitude = points.first[:altitude]
        points.map do |x|
          elevation = max_altitude - x[:altitude]
          [(x[:gps_time] - min_gps_time).round(1), altitude_presenter.call(elevation)]
        end.to_json
      end

      def distance_chart_line
        tmp_distance = 0.0
        tmp_points = [points.first] + points
        tmp_points.each_cons(2).map do |pair|
          [
            (pair.last[:gps_time] - min_gps_time).round(1),
            distance_presenter.call(tmp_distance += TrackSegment.new(pair).distance)
          ]
        end.to_json
      end

      private

      attr_reader :points, :altitude_presenter, :distance_presenter, :min_gps_time
    end
  end
end
