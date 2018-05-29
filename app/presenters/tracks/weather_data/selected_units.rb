module Tracks
  class WeatherData
    class SelectedUnits
      DEFAULT_ALTITUDE_UNITS = 'm'
      DEFAULT_SPEED_UNITS    = 'ms'

      def initialize(params)
        @params = params
      end

      def altitude
        if_none = -> { DEFAULT_ALTITUDE_UNITS }
        available_altitude_units.find(if_none) { |units| units == selected_altitude_units }
      end

      def speed
        if_none = -> { DEFAULT_SPEED_UNITS }
        available_speed_units.find(if_none) { |units| units == selected_speed_units }
      end

      private

      attr_reader :params

      def available_altitude_units
        ALTITUDE_UNITS
      end

      def available_speed_units
        SPEED_UNITS
      end

      def selected_altitude_units
        params[:altitude_unit]
      end

      def selected_speed_units
        params[:wind_speed_unit]
      end
    end
  end
end
