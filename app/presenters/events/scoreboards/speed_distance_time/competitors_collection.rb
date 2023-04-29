module Events
  module Scoreboards
    class SpeedDistanceTime
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
