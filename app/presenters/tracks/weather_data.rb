module Tracks
  class WeatherData
    ALTITUDE_UNITS = %w[m ft].freeze
    SPEED_UNITS    = %w[ms knots kmh mph].freeze

    attr_reader :track, :selected_units

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
      ALTITUDE_UNITS
    end

    def speed_units
      SPEED_UNITS
    end

    private

    def units_from(params)
      SelectedUnits.new(params)
    end
  end
end
