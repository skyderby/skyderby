module WeatherData
  class TrackWeather
    include ActiveModel::Conversion

    delegate :place, to: :track
    delegate :weather_data, to: :track, prefix: true

    def initialize(track)
      @track = track
    end

    def place_weather_data
      return [] unless track.place

      @place_weather ||= track.place.weather_data.for_time(start_time)
    end

    def start_time
      track.points.trimmed.first.gps_time.beginning_of_hour
    end

    private

    attr_reader :track
  end
end
