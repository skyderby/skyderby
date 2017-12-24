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

      @place_weather ||= place.weather_data.for_time(start_time)
    end

    def start_time
      return track.created_at if points.blank?
      points.first.gps_time.beginning_of_hour
    end

    def hidden_columns
      [:actual_on]
    end

    private

    attr_reader :track

    def points
      @points ||= track.points.trimmed
    end
  end
end
