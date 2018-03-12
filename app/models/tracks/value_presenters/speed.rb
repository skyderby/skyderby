module Tracks
  module ValuePresenters
    class Speed
      def initialize(unit_system = 'metric')
        @unit_system = unit_system
      end

      def call(value)
        convert(value).round.truncate
      end

      private

      attr_reader :unit_system

      def convert(value)
        if unit_system == 'metric'
          ms_to_kmh(value)
        else
          ms_to_mph(value)
        end
      end

      def ms_to_kmh(value)
        kmh_in_ms = 3.6
        value * kmh_in_ms
      end

      def ms_to_mph(value)
        mph_in_ms = 2.236936
        value * mph_in_ms
      end
    end
  end
end
