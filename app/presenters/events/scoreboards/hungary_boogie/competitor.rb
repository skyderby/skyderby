module Events
  module Scoreboards
    class HungaryBoogie
      class Competitor < SimpleDelegator
        def initialize(record, scoreboard)
          @record = record
          @scoreboard = scoreboard

          super(@record)
        end

        def total_points
          return 0 if counted_results.blank?

          @total_points ||= counted_results.sum(&:result).to_f / jumps_for_total
        end

        def results
          scoreboard.results.for(competitor: self)
        end

        def counted_results
          @counted_results ||=
            if results.size >= jumps_for_total
              results.sort_by { |x| -x.result }.first(jumps_for_total)
            else
              []
            end
        end

        def average_result
          return 0 if results.blank?

          results.sum(0.0, &:result) / results.size
        end

        private

        attr_reader :record, :scoreboard

        delegate :jumps_for_total, to: :scoreboard
      end
    end
  end
end
