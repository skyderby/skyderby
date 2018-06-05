module Events
  module Scoreboards
    class Category
      delegate :id, :name, :first_position?, :last_position?, :to_key, :model_name, to: :section

      def initialize(section, scoreboard, competitor_class)
        @section = section
        @scoreboard = scoreboard
        @competitor_class = competitor_class
      end

      def competitors
        @competitors ||= CompetitorsCollection.new(section.competitors, scoreboard, competitor_class)
      end

      private

      attr_reader :section, :scoreboard, :competitor_class
    end
  end
end
