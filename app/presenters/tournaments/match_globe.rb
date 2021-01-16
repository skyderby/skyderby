module Tournaments
  class MatchGlobe
    SECONDS_BEFORE_START = 5
    FINISH_LINE_ALTITUDE = 500
    CENTER_LINE_ALTITUDE = 1000
    CompetitorData = Struct.new(:name, :color, :points)

    class EntityBuilder
      def initialize(slot)
        @slot = slot
      end

      def execute
        PointsQuery.execute(
          slot.track,
          trimmed: { seconds_before_start: SECONDS_BEFORE_START },
          freq_1hz: true,
          only: %i[gps_time latitude longitude abs_altitude]
        ).each { |point| point[:gps_time] = point[:gps_time].iso8601 }
      end

      private

      attr_reader :slot
    end

    attr_reader :match

    COLORS = [
      '#7cb5ec',
      '#90ed7d',
      '#f7a35c',
      '#8085e9',
      '#f15c80',
      '#e4d354',
      '#8085e8',
      '#8d4653',
      '#91e8e1',
      '#434348'
    ].freeze

    def initialize(match)
      @match = match
    end

    def competitors
      @competitors ||= match.slots.map.with_index do |val, index|
        CompetitorData.new.tap do |c|
          c.name = val.competitor_name
          c.color = COLORS[index]
          c.points = EntityBuilder.new(val).execute
        end
      end
    end

    def finish_line
      match.tournament.finish_line.to_coordinates.map do |point|
        [point[:longitude].to_f, point[:latitude].to_f, finish_line_altitude]
      end.flatten
    end

    def center_line
      [
        match.tournament.finish_line.center[:longitude].to_f,
        match.tournament.finish_line.center[:latitude].to_f,
        finish_line_altitude,
        match.tournament.place.longitude.to_f,
        match.tournament.place.latitude.to_f,
        start_altitude
      ]
    end

    def center_line_minimums
      [stop_altitude, start_altitude - 300]
    end

    def start_altitude
      competitors.map { |x| x.points.first[:abs_altitude] }.max || CENTER_LINE_ALTITUDE
    end

    def stop_altitude
      competitors.map { |x| x.points.last[:abs_altitude] }.min || 0
    end

    def finish_line_altitude
      stop_altitude + FINISH_LINE_ALTITUDE
    end
  end
end
