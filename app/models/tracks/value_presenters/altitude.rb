module Tracks
  module ValuePresenters
    class Altitude
      def initialize(unit_system = 'metric')
        @unit_system = unit_system
      end

      def call(value)
        converted = convert(value)
        return 0 if converted.nil? || (converted.is_a?(Float) && converted.nan?)

        converted.round.truncate
      end

      private

      attr_reader :unit_system

      def convert(value)
        return nil if value.nil?

        if unit_system == 'metric'
          value
        else
          ft_in_m = 3.280839895
          value * ft_in_m
        end
      end
    end
  end
end
