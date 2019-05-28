module Events
  module Scoreboards
    class Category < SimpleDelegator
      def initialize(section, scoreboard, collection_class)
        @scoreboard = scoreboard
        @collection_class = collection_class

        super(section)
      end

      def competitors
        @competitors ||= collection_class.new \
          super.includes(profile: [:country], suit: [:manufacturer]),
          scoreboard
      end

      private

      attr_reader :scoreboard, :collection_class
    end
  end
end
