class Track < ApplicationRecord
  module WeatherData
    extend ActiveSupport::Concern

    def weather_data # rubocop:disable Metrics/AbcSize,Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
      return Place::WeatherDatum.none if place.blank? || base?

      time_on_recording_start = points.trimmed.first&.gps_time
      time_on_recording_end = points.trimmed.last&.gps_time
      return Place::WeatherDatum.none if time_on_recording_start.blank? || time_on_recording_end.blank?

      time_range = time_on_recording_start.beginning_of_hour.to_i..time_on_recording_end.beginning_of_hour.to_i
      weather_data = time_range.step(1.hour).map do |time|
        place.weather_data.for_time(Time.zone.at(time))
      end
      return Place::WeatherDatum.none if weather_data.any?(&:exists?)

      weather_data.inject(:or)
    end
  end
end
