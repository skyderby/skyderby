module Events
  module Rounds
    class Map
      COLORS = %w[#7cb5ec #434348 #90ed7d #f7a35c #8085e9 #f15c80 #e4d354 #8085e8 #8d4653 #91e8e1].freeze

      delegate :event, to: :round

      def initialize(round)
        @round = round
      end

      def competitors
        @competitors ||=
          round.event_tracks
          .map { |event_track| Events::Maps::CompetitorTrack.new(event_track) }
          .sort_by(&:start_time)
          .each_with_index { |data, index| data.color = colors[index] }
      end

      def competitors_by_groups
        @competitors_by_groups ||= competitors.slice_when do |first, second|
            (first.start_time - second.start_time).abs >= 2.minutes
        end
      end

      private

      attr_reader :round

      def colors
        COLORS * (round.event_tracks.size.to_f / COLORS.size).ceil
      end
    end
  end
end
