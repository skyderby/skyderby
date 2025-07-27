class Track < ApplicationRecord
  module WeatherData
    extend ActiveSupport::Concern

    def weather_data # rubocop:disable Metrics/AbcSize,Metrics/CyclomaticComplexity,Metrics/PerceivedComplexity
      return Place::WeatherDatum.none if place.blank? || base?

      trimmed_points = points.order(:gps_time_in_seconds).trimmed(seconds_before_start: 20, seconds_after_end: 125)
      time_on_recording_start = trimmed_points.first&.gps_time
      time_on_recording_end = trimmed_points.last&.gps_time
      return Place::WeatherDatum.none if time_on_recording_start.blank? || time_on_recording_end.blank?

      time_range = time_on_recording_start.beginning_of_hour.to_i..time_on_recording_end.beginning_of_hour.to_i
      weather_data = time_range.step(1.hour).map do |time|
        place.weather_data.for_time(Time.zone.at(time))
      end
      return Place::WeatherDatum.none if weather_data.any?(&:empty?)

      weather_data.inject(:or)
    end
  end
end
