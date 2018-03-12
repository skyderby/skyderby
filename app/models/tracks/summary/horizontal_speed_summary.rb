module Tracks
  module Summary
    class HorizontalSpeedSummary
      def initialize(points, zerowind_points, track_distance, zero_wind_track_distance, time, presenter)
        @points = points
        @zerowind_points = zerowind_points
        @track_distance = track_distance
        @zero_wind_track_distance = zero_wind_track_distance
        @time = time
        @presenter = presenter
      end

      def avg_horizontal_speed
        return 0 if time.zero?
        presenter.call(track_distance / time)
      end

      def min_horizontal_speed
        return 0.0 if points.blank?

        point = points.min_by { |x| x[:h_speed] }
        presenter.call(point[:h_speed])
      end

      def max_horizontal_speed
        return 0.0 if points.blank?

        point = points.max_by { |x| x[:h_speed] }
        presenter.call(point[:h_speed])
      end

      def zero_wind_horizontal_speed
        return 0 if time.zero?
        presenter.call(zero_wind_track_distance / time)
      end

      def horizontal_speed_wind_effect
        return 0 if time.zero?

        wind_effect = (track_distance / time) - (zero_wind_track_distance / time)
        sign = wind_effect.positive? ? '+' : ''
        "#{sign}#{presenter.call(wind_effect)}"
      end

      def horizontal_speed_wind_effect_in_percents
        return 0 if time.zero?

        raw_speed = (track_distance / time)
        zero_wind = (zero_wind_track_distance / time)

        return 0 if raw_speed.zero?

        ((raw_speed - zero_wind).abs / raw_speed * 100).round
      end

      def zero_wind_horizontal_speed_in_percents
        100 - horizontal_speed_wind_effect_in_percents
      end

      private

      attr_reader :points, :zerowind_points, :track_distance, :zero_wind_track_distance, :time, :presenter
    end
  end
end
