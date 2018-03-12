module Tracks
  module Summary
    class DistanceSummary
      def initialize(track_distance, zero_wind_distance, presenter)
        @track_distance = track_distance
        @zero_wind_track_distance = zero_wind_distance
        @presenter = presenter
      end

      def distance
        presenter.call(track_distance)
      end

      def zero_wind_distance
        presenter.call(zero_wind_track_distance)
      end

      def distance_wind_effect
        wind_effect = track_distance - zero_wind_distance
        sign = wind_effect.positive? ? '+' : ''
        "#{sign}#{presenter.call(wind_effect)}"
      end

      def distance_wind_effect_in_percents
        return 0 if track_distance.zero?
        ((track_distance - zero_wind_distance).abs / track_distance * 100).round
      end

      def zero_wind_distance_in_percents
        100 - distance_wind_effect_in_percents
      end

      private

      attr_reader :track_distance, :zero_wind_track_distance, :presenter
    end
  end
end
