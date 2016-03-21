module Skyderby
  module Tracks
    class MapsData < TrackData
      attr_reader :weather_data, :zerowind_points

      def initialize(track)
        @track = track
        @track_points = Points.new(@track).trimmed

        @weather_data = []
        @points = []
        @zerowind_points = []

        init_weather_data
        init_points
      end

      private

      # Track may have weather data associated by itself or
      # associated with event
      def init_weather_data
        @weather_data = @track.weather_data if @track.weather_data.any?
        
        if @track.competitive? && @track.event_track.event.weather_data.any?
          @weather_data = @track.event_track.event.weather_data
        end
      end

      def init_points
        @points = @track_points.map do |x|
          { latitude: x[:latitude], longitude: x[:longitude], h_speed: x[:h_speed] }
        end

        return if @weather_data.blank?

        wind_data = Skyderby::WindCancellation::WindData.new(@weather_data)
        zerowind_points_data = 
          Skyderby::WindCancellation::WindSubtraction.new(@track_points, wind_data).execute

        @zerowind_points = zerowind_points_data.map do |x|
          { latitude: x[:latitude], longitude: x[:longitude], h_speed: x[:h_speed] }
        end
      end
    end
  end
end
