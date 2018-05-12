module Tracks
  module WindCancellation
    class Processor
      def self.call(points, weather_data)
        new(points, weather_data).call
      end

      def initialize(points, weather_data)
        @points = points
        @weather_data = weather_data
      end

      def call
        return [] if weather_data.blank? || points.blank?

        calculate
      end

      private

      attr_reader :points, :weather_data

      def calculate
        points_for_subtraction = points.tap do |tmp|
          tmp.first[:time_diff] = 0
          tmp.each_cons(2) do |prev, cur|
            cur[:time_diff] = cur[:gps_time] - prev[:gps_time]
          end
        end
        wind_data = ::WindCancellation::WindData.new(weather_data)
        points_after_subtraction = ::WindCancellation::WindSubtraction.new(points_for_subtraction, wind_data).execute
        points_after_subtraction.each_cons(2) do |prev, cur|
          cur[:h_speed] = TrackSegment.new([prev, cur]).distance / cur[:time_diff]
          cur[:v_speed] = (prev[:altitude] - cur[:altitude]) / cur[:time_diff]
          cur[:glide_ratio] = cur[:h_speed] / (cur[:v_speed].zero? ? 0.1 : cur[:v_speed])
        end
        points_after_subtraction
      end
    end
  end
end
