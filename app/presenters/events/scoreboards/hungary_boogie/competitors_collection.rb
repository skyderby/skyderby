module Events
  module Scoreboards
    class HungaryBoogie
      class CompetitorsCollection
        include Enumerable

        def initialize(competitors, scoreboard)
          @section_competitors = competitors
          @scoreboard = scoreboard
        end

        def each(&)
          competitors.each(&)
        end

        def to_a
          competitors
        end

        private

        attr_reader :section_competitors, :scoreboard

        def competitors
          @competitors =
            section_competitors
            .then { |collection| map_competitors(collection) }
            .then { |collection| sort_competitors(collection) }
        end

        def map_competitors(collection)
          collection.map do |competitor|
            HungaryBoogie::Competitor.new(competitor, scoreboard)
          end
        end

        def sort_competitors(collection)
          collection.sort_by do |competitor|
            [-competitor.total_points,
             -competitor.results.count,
             -competitor.average_result,
             competitor.name]
          end
        end
      end
    end
  end
end
