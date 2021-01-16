module Tournaments
  class MatchMap
    SECONDS_BEFORE_START = 10
    CompetitorData = Struct.new(:name, :color, :path)

    delegate :tournament, to: :match
    delegate :place, to: :tournament

    class PathBuilder
      def self.call(slot)
        new(slot).call
      end

      def initialize(slot)
        @slot = slot
      end

      def call
        PointsQuery.execute(
          slot.track,
          trimmed: { seconds_before_start: SECONDS_BEFORE_START },
          freq_1hz: true,
          only: %i[gps_time latitude longitude]
        ).map { |p| { lat: p[:latitude].to_f, lng: p[:longitude].to_f } }
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
          c.path = PathBuilder.call(val)
        end
      end
    end

    def finish_line
      match.tournament.finish_line.to_coordinates
    end

    private

    attr_reader :match
  end
end
