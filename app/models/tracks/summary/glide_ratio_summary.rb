module Tracks
  module Summary
    class GlideRatioSummary
      def initialize(points, zerowind_points, track_elevation, track_distance, zero_wind_distance, presenter) # rubocop:disable Metrics/ParameterLists
        @points = points
        @zerowind_points = zerowind_points
        @track_elevation = track_elevation
        @track_distance = track_distance
        @zero_wind_distance = zero_wind_distance
        @presenter = presenter
      end

      def glide_ratio
        return 0.0 if track_elevation.zero?

        presenter.call(track_distance.to_d / track_elevation.to_d)
      end

      def min_glide_ratio
        return 0.0 if points.blank?

        point = points.min_by { |x| x[:glide_ratio] }
        presenter.call(point[:glide_ratio])
      end

      def max_glide_ratio
        return 0.0 if points.blank?

        point = points.max_by { |x| x[:glide_ratio] }
        if point[:glide_ratio] < 10
          presenter.call(point[:glide_ratio])
        else
          '≥10'
        end
      end

      def zero_wind_glide_ratio
        return 0.0 if track_elevation.zero?

        presenter.call(zero_wind_distance.to_d / track_elevation.to_d)
      end

      def glide_ratio_wind_effect
        wind_effect = glide_ratio - zero_wind_glide_ratio
        sign = wind_effect.positive? ? '+' : ''
        "#{sign}#{presenter.call(wind_effect)}"
      end

      private

      attr_reader :points, :zerowind_points, :track_elevation, :track_distance, :zero_wind_distance, :presenter
    end
  end
end
