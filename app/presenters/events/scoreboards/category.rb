module Events
  module Scoreboards
    class Category < SimpleDelegator
      def initialize(section, scoreboard, competitor_class)
        @scoreboard = scoreboard
        @competitor_class = competitor_class

        super(section)
      end

      def competitors
        @competitors ||= Events::Scoreboards::CompetitorsCollection.new(
          super,
          scoreboard,
          competitor_class
        )
      end

      private

      attr_reader :scoreboard, :competitor_class
    end
  end
end
