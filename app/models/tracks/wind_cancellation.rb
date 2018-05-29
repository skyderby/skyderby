module Tracks
  module WindCancellation
    def wind_cancelation?
      weather_data.any?
    end

    def weather_data
      min_gps_time = points.first&.fetch(:gps_time) || track.recorded_at
      return [] if min_gps_time.blank? || track.place.blank?

      @weather_data ||= begin
        start_time = min_gps_time.beginning_of_hour
        track.place.weather_data.for_time(start_time)
      end
    end

    def zerowind_points
      @zerowind_points ||= Processor.call(points, weather_data)
    end
  end
end
