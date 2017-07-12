module Tournaments
  class MatchGlobe
    SECONDS_BEFORE_START = 10
    FINISH_LINE_ALTITUDE = 500
    CENTER_LINE_ALTITUDE = 1000
    CompetitorData = Struct.new(:name, :color, :points)

    class EntityBuilder
      def initialize(slot)
        @slot = slot
      end

      def execute
        slot
          .track
          .points
          .trimmed(seconds_before_start: SECONDS_BEFORE_START)
          .freq_1Hz
          .pluck_to_hash(:latitude,
                         :longitude,
                         :abs_altitude,
                         'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time')
      end

      private

      attr_reader :slot
    end

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

    def to_json
      {
        finish_line: finish_line,
        finish_line_minimums: [stop_altitude] * 2,
        center_line: center_line,
        center_line_minimums: center_line_minimums,
        competitors: competitors
      }.to_json
    end

    private

    def finish_line
      match.tournament.finish_line.map do |point|
        [point.longitude, point.latitude, finish_line_altitude]
      end.flatten
    end

    def center_line
      [
        finish_line_center[:longitude], finish_line_center[:latitude], finish_line_altitude,
        match.tournament.exit_lon, match.tournament.exit_lat, start_altitude
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

    def finish_line_center
      start_lat = match.tournament.finish_line.first.latitude
      end_lat = match.tournament.finish_line.last.latitude

      start_lon = match.tournament.finish_line.first.longitude
      end_lon = match.tournament.finish_line.last.longitude

      center_lat = start_lat + (end_lat - start_lat) / 2
      center_lon = start_lon + (end_lon - start_lon) / 2

      { latitude: center_lat, longitude: center_lon }
    end

    attr_reader :match
  end
end
