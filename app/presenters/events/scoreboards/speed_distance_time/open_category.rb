module Events
  module Scoreboards
    class SpeedDistanceTime
      class OpenCategory
        def initialize(scoreboard, collection_class)
          @scoreboard = scoreboard
          @event = scoreboard.event
          @collection_class = collection_class
        end

        def competitors
          @competitors ||= collection_class.new \
            event.competitors.includes(profile: [:country], suit: [:manufacturer]),
            scoreboard
        end

        def id; end

        private

        attr_reader :event, :scoreboard, :collection_class
      end
    end
  end
end
