module Events
  module Scoreboards
    class SpeedDistanceTime
      class Competitor < SimpleDelegator
        def initialize(record, scoreboard)
          @record = record
          @scoreboard = scoreboard

          super(@record)
        end

        def points_in_discipline(discipline)
          points_in_disciplines[discipline]
        end

        def total_points
          points_in_disciplines
            .sum { |_discipline, points| points }
            .round(1)
        end

        def results
          scoreboard.results.for(competitor: self)
        end

        private

        attr_reader :record, :scoreboard

        def points_in_disciplines
          @points_in_disciplines ||=
            scoreboard.rounds_by_discipline.each_with_object({}) do |(discipline, rounds), memo|
              active_rounds = rounds.select(&:completed)
              next if active_rounds.count.zero?

              sum_of_points =
                active_rounds
                .filter_map { |round| scoreboard.results.for(competitor: self, round: round) }
                .sum(&:points)

              memo[discipline] = sum_of_points.to_f / active_rounds.count
            end
        end
      end
    end
  end
end
