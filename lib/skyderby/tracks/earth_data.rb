module Skyderby
  module Tracks
    class EarthData < TrackData
      private

      def init_points
        @points = Skyderby::Tracks::Points.new(@track).trimmed.map do |x|
          {
            latitude: x[:latitude],
            longitude: x[:longitude],
            h_speed: x[:h_speed],
            elevation: x[:abs_altitude] ? x[:elevation] : x[:abs_altitude]
          }
        end
      end
    end
  end
end
