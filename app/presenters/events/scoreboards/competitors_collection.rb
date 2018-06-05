module Events
  module Scoreboards
    class CompetitorsCollection
      include Enumerable

      def initialize(competitors, scoreboard, competitor_class)
        @section_competitors = competitors
        @scoreboard = scoreboard
        @competitor_class = competitor_class
      end

      def each(&block)
        competitors.each(&block)
      end

      def to_a
        competitors
      end

      private

      attr_reader :section_competitors, :scoreboard, :competitor_class

      def competitors
        @competitors =
          section_competitors
          .yield_self(&method(:map_competitors))
          .yield_self(&method(:order_by_total_points))
      end

      def map_competitors(collection)
        collection.map do |competitor|
          competitor_class.new(competitor, scoreboard)
        end
      end

      def order_by_total_points(collection)
        collection.sort_by { |competitor| -competitor.total_points }
      end
    end
  end
end
