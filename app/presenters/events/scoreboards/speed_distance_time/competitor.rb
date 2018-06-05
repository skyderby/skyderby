module Events
  module Scoreboards
    class SpeedDistanceTime
      class Competitor
        delegate :id, :name, :profile, :suit, :suit_name, :country_code, :country_name, :to_key, :model_name, to: :record

        def initialize(record, scoreboard)
          @record = record
          @scoreboard = scoreboard
        end

        def points_in_discipline(discipline)
          points_in_disciplines[discipline]
        end

        def total_points
          points_in_disciplines
            .map { |discipline, points| points }
            .sum
            .round(2)
        end

        private

        attr_reader :record, :scoreboard

        def points_in_disciplines
          @points_in_disciplines ||= scoreboard.rounds_by_discipline.each_with_object({}) do |(discipline, rounds), memo|
            sum_of_points =
              rounds
              .map { |round| scoreboard.results.for(competitor: self, round: round) }
              .compact
              .map(&:points)
              .sum

            memo[discipline] = sum_of_points.to_f / rounds.count
          end
        end
      end
    end
  end
end
