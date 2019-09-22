module Events
  module Rounds
    class Show
      GROUP_SEPARATION = 2.minutes

      attr_reader :round, :event

      delegate :id, :event_id, :discipline, :number, :reference_point_assignments, to: :round
      delegate :designated_lane_start, :range_from, :range_to, to: :event

      def initialize(event, round_id)
        @event = event
        @round = event.rounds.includes(
          :reference_point_assignments,
          results: { competitor: :profile }
        ).find(round_id)
      end

      def groups
        @groups ||= competitor_results.sort_by(&:start_time).slice_when do |first, second|
          (first.start_time - second.start_time).abs >= GROUP_SEPARATION
        end
      end

      def competitor_results
        @competitor_results ||=
          round.results.map { |result| CompetitorResult.new(result) }
      end
    end
  end
end
