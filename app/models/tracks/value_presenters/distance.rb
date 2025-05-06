module Tracks
  module ValuePresenters
    class Distance
      def initialize(unit_system = 'metric')
        @unit_system = unit_system
      end

      def call(value)
        return 0 if value.nil?

        if unit_system == 'metric'
          value.is_a?(Float) && value.nan? ? 0 : value.round.truncate
        else
          converted = convert(value)
          converted.nil? || (converted.is_a?(Float) && converted.nan?) ? 0 : converted.round(2).to_f
        end
      end

      private

      attr_reader :unit_system

      def convert(value)
        return nil if value.nil?

        meters_in_mile = 1609.344
        value / meters_in_mile
      end
    end
  end
end
