module Tracks
  module Summary
    class VerticalSpeedSummary
      def initialize(points, elevation, time, presenter)
        @points = points
        @elevation = elevation
        @time = time
        @presenter = presenter
      end

      def avg_vertical_speed
        return nil if time.zero?

        presenter.call(elevation / time)
      end

      def min_vertical_speed
        return 0.0 if points.blank?

        point = points.min_by { |x| x[:v_speed] }
        presenter.call(point[:v_speed])
      end

      def max_vertical_speed
        return 0.0 if points.blank?

        point = points.max_by { |x| x[:v_speed] }
        presenter.call(point[:v_speed])
      end

      private

      attr_reader :points, :elevation, :time, :presenter
    end
  end
end
