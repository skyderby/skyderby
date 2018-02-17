module Tracks
  class FlaresDetector
    class Flare
      def initialize(points)
        @points = points
      end

      def altitude_gain
        higher_point[:altitude_gain]
      end

      def gain_duration
        higher_point[:gps_time] - points.first[:gps_time]
      end

      private

      def higher_point
        @higher_point ||= points.max_by { |point| point[:altitude_gain] }
      end

      attr_reader :points
    end

    def self.call(points)
      new(points).call
    end

    def initialize(points)
      @points = points
    end

    def call
      find_flares
    end

    private

    def find_flares
      flares_segments.map { |segment| Flare.new(segment) }
    end

    def flares_segments
      all_segments.reject do |segment|
        segment.all? { |point| point[:altitude_gain].zero? }
      end
    end

    def all_segments
      flares_map.slice_when do |before, after|
        before[:altitude_gain].zero? && after[:altitude_gain].positive? ||
          before[:altitude_gain].positive? && after[:altitude_gain].zero?
      end
    end

    def flares_map
      altitude_gain = 0

      points.each_cons(2) do |prev, current|
        altitude_change = current[:altitude] - prev[:altitude]
        altitude_gain += altitude_change
        altitude_gain = 0 if altitude_gain.negative?

        current[:altitude_gain] = altitude_gain
      end

      points[0][:altitude_gain] = 0

      points
    end

    attr_reader :points
  end
end
