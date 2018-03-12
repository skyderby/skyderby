module Tracks
  module WindCancellation
    def wind_cancelation?
      weather_data.any?
    end

    def weather_data
      min_gps_time = points.first&.fetch(:gps_time) || track.recorded_at
      return [] if min_gps_time.blank?

      @weather_data ||= begin
        start_time = min_gps_time.beginning_of_hour

        if track.weather_data.any?
          track.weather_data
        elsif weather_data_from_competition?(start_time)
          track.event.weather_data.for_time(start_time)
        elsif weather_data_from_place?(start_time)
          track.place.weather_data.for_time(start_time)
        else
          []
        end
      end
    end

    def weather_data_from_competition?(start_time)
      return false unless track.competitive?
      track.event.weather_data.for_time(start_time).any?
    end

    def weather_data_from_place?(start_time)
      return false unless track.place
      track.place.weather_data.for_time(start_time).any?
    end

    def zerowind_points
      @zerowind_points ||= Processor.call(points, weather_data)
    end
  end
end
