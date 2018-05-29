module Skyderby
  module Tracks
    class MapsData
      def initialize(track)
        @track = track
      end

      # Track may have weather data associated by itself or
      # associated with place or with event
      def weather_data
        @weather_data ||= track.weather_data
      end

      def points
        @points ||= track_points.map do |x|
          { latitude: x[:latitude], longitude: x[:longitude], h_speed: x[:h_speed] }
        end
      end

      def zerowind_points
        return [] if weather_data.blank?

        @zerowind_points ||= begin
          wind_data = WindCancellation::WindData.new(weather_data)
          zerowind_points_data =
            WindCancellation::WindSubtraction.new(track_points, wind_data).execute

          zerowind_points_data.map do |x|
            { latitude: x[:latitude], longitude: x[:longitude], h_speed: x[:h_speed] }
          end
        end
      end

      private

      attr_reader :track

      def start_time
        track_points.first[:gps_time].beginning_of_hour
      end

      def track_points
        @track_points ||= begin
          PointsQuery.execute(
            track,
            trimmed: true,
            freq_1Hz: true,
            only: [:gps_time, :altitude, :latitude, :longitude, :h_speed, :time_diff]
          )
        end
      end
    end
  end
end
