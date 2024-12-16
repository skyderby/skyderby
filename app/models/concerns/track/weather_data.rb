class Track < ApplicationRecord
  module WeatherData
    extend ActiveSupport::Concern

    def weather_data
      return Place::WeatherDatum.none if place.blank? || base?

      time_on_recording_start = points.trimmed.first&.gps_time
      time_on_recording_end = points.trimmed.last&.gps_time
      return Place::WeatherDatum.none if time_on_recording_start.blank? || time_on_recording_end.blank?

      weather_data = (time_on_recording_start.beginning_of_hour..time_on_recording_end.end_of_hour).step(1.hour).map do |time|
        place.weather_data.for_time(time)
      end
      return Place::WeatherDatum.none if weather_data.any?(&:blank?)

      weather_data
    end
  end
end
