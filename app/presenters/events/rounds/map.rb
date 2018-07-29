module Events
  module Rounds
    class Map
      COLORS = %w[#7cb5ec #434348 #90ed7d #f7a35c #8085e9 #f15c80 #e4d354 #8085e8 #8d4653 #91e8e1].freeze

      attr_reader :round

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

      def show_reference_points?
        reference_points.any?
      end

      def reference_points
        @reference_points ||= event.reference_points
      end

      def reference_point_assignment(competitor)
        reference_point_assignments.find { |assignment| assignment.competitor == competitor }
      end

      private

      def reference_point_assignments
        @reference_point_assignments = round.reference_point_assignments.to_a
      end

      def colors
        COLORS * (round.event_tracks.size.to_f / COLORS.size).ceil
      end
    end
  end
end
