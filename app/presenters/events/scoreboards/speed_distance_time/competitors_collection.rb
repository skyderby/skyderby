module Events
  module Scoreboards
    class SpeedDistanceTime
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
            .yield_self(&method(:map_competitors))
            .yield_self(&method(:sort_competitors))
        end

        def map_competitors(collection)
          collection.map do |competitor|
            SpeedDistanceTime::Competitor.new(competitor, scoreboard)
          end
        end

        def sort_competitors(collection)
          collection.sort_by { |competitor| -competitor.total_points }
        end
      end
    end
  end
end
