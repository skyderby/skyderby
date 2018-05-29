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

    SelectedUnits = Struct.new(:altitude, :speed)

    attr_reader :track, :selected_units
    delegate :place, to: :track

    def initialize(track, params)
      @track = track
      @selected_units = units_from(params)
    end

    def rows
      @rows ||= track.weather_data.map do |weather_datum|
        Row.new(weather_datum, selected_units)
      end
    end

    def altitude_units
      %w[m ft]
    end

    def speed_units
      %w[ms knots kmh mph]
    end

    private

    DEFAULT_ALTITUDE_UNITS = 'm'
    DEFAULT_SPEED_UNITS    = 'ms'

    def units_from(params)
      altitude =
        if params[:altitude_unit].present? && altitude_units.include?(params[:altitude_unit])
          params[:altitude_unit]
        else
          DEFAULT_ALTITUDE_UNITS
        end

      speed =
        if params[:wind_speed_unit].present? && speed_units.include?(params[:wind_speed_unit])
          params[:wind_speed_unit]
        else
          DEFAULT_SPEED_UNITS
        end

      SelectedUnits.new(altitude, speed)
    end
  end
end
