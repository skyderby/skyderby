module Tracks
  module ValuePresenters
    class Distance
      def initialize(unit_system = 'metric')
        @unit_system = unit_system
      end

      def call(value)
        if unit_system == 'metric'
          value.round.truncate
        else
          convert(value).round(2).to_f
        end
      end

      private

      attr_reader :unit_system

      def convert(value)
        meters_in_mile = 1609.344
        value * meters_in_mile
      end
    end
  end
end
