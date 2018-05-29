class Track < ApplicationRecord
  module WeatherData
    extend ActiveSupport::Concern

    def weather_data
      return [] if place.blank? || base?

      weather_time = (start_time || recorded_at).beginning_of_hour

      @weather_data ||= place.weather_data.for_time(weather_time)
    end
  end
end
