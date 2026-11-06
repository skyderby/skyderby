module Tracks
  class FlaresDetector
    class Flare
      MIN_ENTRY_SPEED = 100
      MAX_ENERGY_CONVERSION = 0.4
      LEAD_SECONDS = 8
      GRAVITY = 9.81
      KMH = 3.6

      def initialize(points, lead = [])
        @points = points
        @lead = lead
      end

      def plausible?
        return true unless speeds_known?

        entry_speed >= MIN_ENTRY_SPEED && altitude_gain <= MAX_ENERGY_CONVERSION * energy_height
      end

      def entry_speed
        @entry_speed ||= lead.map { |point| Math.hypot(point[:h_speed], point[:v_speed]) }.max.to_f
      end

      def altitude_gain
        higher_point[:altitude_gain]
      end

      def gain_duration
        higher_point[:gps_time] - points.first[:gps_time]
      end

      def higher_point
        @higher_point ||= points.max_by { |point| point[:altitude_gain] }
      end

      attr_reader :points

      private

      attr_reader :lead

      def speeds_known? = lead.any? && lead.all? { |point| point[:h_speed] && point[:v_speed] }

      def energy_height = (entry_speed / KMH)**2 / (2 * GRAVITY)
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
      flares_segments.map { |segment| Flare.new(segment, lead_points(segment.first)) }.select(&:plausible?)
    end

    def lead_points(start)
      points.select { |point| point[:gps_time].between?(start[:gps_time] - Flare::LEAD_SECONDS, start[:gps_time]) }
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
      return points if points.empty?

      altitude_gain = 0

      points.each_cons(2) do |prev, current|
        altitude_gain += current_gain(prev, current)
        altitude_gain = 0 if altitude_gain.negative?

        current[:altitude_gain] = altitude_gain
      end

      points[0][:altitude_gain] = 0

      points
    end

    def current_gain(prev, current)
      if current[:v_speed].negative?
        current[:altitude] - prev[:altitude]
      else
        # In case vertical speed shows it descending and altitude
        # change shows it is gain (positive change) make it negative
        -(current[:altitude] - prev[:altitude]).abs
      end
    end

    attr_reader :points
  end
end
