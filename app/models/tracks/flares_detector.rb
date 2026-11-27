module Tracks
  class FlaresDetector
    class Flare
      MIN_ENTRY_SPEED = Track::Points.from_kmh(100)
      MAX_ENERGY_CONVERSION = 0.4
      LEAD_SECONDS = 8
      GRAVITY = 9.81

      attr_reader :points

      def initialize(points, gains, lead = [])
        @points = points
        @gains = gains
        @lead = lead
      end

      def plausible?
        return true unless speeds_known?

        entry_speed >= MIN_ENTRY_SPEED && altitude_gain <= MAX_ENERGY_CONVERSION * energy_height
      end

      def entry_speed
        @entry_speed ||= lead.map { |point| Math.hypot(point[:h_speed], point[:v_speed]) }.max.to_f
      end

      def altitude_gain = gains.max

      def gain_duration
        higher_point[:gps_time] - points.first[:gps_time]
      end

      def higher_point = points[gains.index(altitude_gain)]

      private

      attr_reader :gains, :lead

      def speeds_known? = lead.any? && lead.all? { |point| point[:h_speed] && point[:v_speed] }

      def energy_height = entry_speed**2 / (2 * GRAVITY)
    end

    def self.call(points, check_plausibility: true)
      new(points, check_plausibility:).call
    end

    def initialize(points, check_plausibility: true)
      @points = points
      @check_plausibility = check_plausibility
    end

    def call
      flares = flare_segments.map do |indexes|
        Flare.new(points.values_at(*indexes), gains.values_at(*indexes), lead_points(points[indexes.first]))
      end
      check_plausibility ? flares.select(&:plausible?) : flares
    end

    private

    attr_reader :points, :check_plausibility

    def lead_points(start)
      points.select { |point| point[:gps_time].between?(start[:gps_time] - Flare::LEAD_SECONDS, start[:gps_time]) }
    end

    def flare_segments
      points.each_index
            .slice_when { |before, after| gains[before].zero? != gains[after].zero? }
            .reject { |indexes| indexes.all? { |index| gains[index].zero? } }
    end

    def gains
      @gains ||= points.each_cons(2).with_object([0]) do |(prev, current), gains|
        gains << [gains.last + current_gain(prev, current), 0].max
      end
    end

    def current_gain(prev, current)
      if current[:v_speed].negative?
        current[:altitude] - prev[:altitude]
      else
        -(current[:altitude] - prev[:altitude]).abs
      end
    end
  end
end
