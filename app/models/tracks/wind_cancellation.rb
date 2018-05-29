module Tracks
  module WindCancellation
    def wind_cancelation?
      weather_data.any?
    end

    def weather_data
      @weather_data ||= track.weather_data
    end

    def zerowind_points
      @zerowind_points ||= Processor.call(points, weather_data)
    end
  end
end
