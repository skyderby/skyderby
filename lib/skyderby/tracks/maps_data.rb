module Skyderby
  module Tracks
    class MapsData
      def initialize(track)
        @track = track
      end

      # Track may have weather data associated by itself or
      # associated with place or with event
      def weather_data
        @weather_data ||=
          if track.weather_data.any?
            track.weather_data
          elsif track.competitive? && track.event.weather_data.for_time(start_time).any?
            track.event.weather_data.for_time(start_time)
          elsif track&.place&.weather_data.for_time(start_time).any?
            track.place.weather_data.for_time(start_time)
          else
            []
          end
      end

      def points
        @points ||= track_points.map do |x|
          { latitude: x[:latitude], longitude: x[:longitude], h_speed: x[:h_speed] }
        end
      end

      def zerowind_points
        return [] if weather_data.blank?

        @zerowind_points ||= begin
          wind_data = Skyderby::WindCancellation::WindData.new(weather_data)
          zerowind_points_data =
            Skyderby::WindCancellation::WindSubtraction.new(track_points, wind_data).execute

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
          db_tracks_points.tap do |tmp|
            tmp.first[:time_diff] = 0
            tmp.each_cons(2) do |prev, cur|
              cur[:time_diff] = cur[:gps_time] - prev[:gps_time]
            end
          end
        end
      end

      def db_tracks_points
        track.points.trimmed.freq_1Hz.pluck_to_hash(
          'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
          "#{@track.point_altitude_field} AS altitude",
          :latitude,
          :longitude,
          :h_speed
        )
      end
    end
  end
end
