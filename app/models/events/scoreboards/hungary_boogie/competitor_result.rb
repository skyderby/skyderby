module Events
  module Scoreboards
    class HungaryBoogie
      class CompetitorResult < SimpleDelegator
        def initialize(competitor, jumps_for_total)
          @jumps_for_total = jumps_for_total
          super(competitor)
        end

        def total_points
          return 0 unless counted_results
          @total_points ||= counted_results.map(&:result).sum.to_f / jumps_for_total
        end

        def counted_results
          @counted_results ||= begin
            result_tracks = event_tracks.reject(&:is_disqualified)
            if result_tracks.size >= jumps_for_total
              result_tracks.sort_by { |x| -x.result }.first(jumps_for_total)
            end
          end
        end

        def average_result
          results_values = event_tracks.reject(&:is_disqualified).map(&:result)
          return 0 if results_values.blank?
          results_values.inject(0.0) { |sum, el| sum + el } / results_values.size
        end

        private

        attr_reader :jumps_for_total
      end
    end
  end
end
