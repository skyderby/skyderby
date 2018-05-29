module Tracks
  class WeatherData
    class Row
      attr_reader :altitude, :wind_speed, :wind_direction

      def initialize(weather_datum, selected_units)
        @altitude       = weather_datum.altitude.convert_to(selected_units.altitude).round.truncate
        @wind_speed     = weather_datum.wind_speed.convert_to(selected_units.speed).round(1)
        @wind_direction = weather_datum.wind_direction.truncate
      end
    end
  end
end
