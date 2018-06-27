module Tournaments
  class MatchMap
    SECONDS_BEFORE_START = 10
    CompetitorData = Struct.new(:name, :color, :path)

    class PathBuilder
      def initialize(slot)
        @slot = slot
      end

      def execute
        slot
          .track
          .points
          .trimmed(seconds_before_start: SECONDS_BEFORE_START)
          .freq_1Hz
          .pluck_to_hash(:latitude, :longitude)
          .map { |p| { lat: p[:latitude].to_f, lng: p[:longitude].to_f } }
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
          c.path = PathBuilder.new(val).execute
        end
      end
    end

    def to_json
      {
        finish_line: finish_line,
        exit_point: {
          latitude: match.tournament.exit_lat,
          longitude: match.tournament.exit_lon
        },
        competitors: competitors
      }.to_json
    end

    private

    def finish_line
      match.tournament.finish_line.map do |point|
        {
          latitude: point.latitude,
          longitude: point.longitude
        }
      end
    end

    attr_reader :match
  end
end
