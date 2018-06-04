module Events
  module Scoreboards
    class SpeedDistanceTime
      class SectionPresenter
        def initialize(section, scoreboard)
          @section = section
          @scoreboard = scoreboard
        end

        def competitors
          @competitors ||= CompetitorsCollection.new(section.competitors, scoreboard)
        end

        private

        attr_reader :section, :scoreboard
      end
    end
  end
end
