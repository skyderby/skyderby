module Events
  module Scoreboards
    class HungaryBoogie
      class CompetitorsCollection
        include Enumerable

        def initialize(competitors, scoreboard)
          @section_competitors = competitors
          @scoreboard = scoreboard
        end

        def each(&block)
          competitors.each(&block)
        end

        def to_a
          competitors
        end

        private

        attr_reader :section_competitors, :scoreboard

        def competitors
          @competitors =
            section_competitors
            .then(&method(:map_competitors))
            .then(&method(:sort_competitors))
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
