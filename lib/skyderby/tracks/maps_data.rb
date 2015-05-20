module Skyderby
  module Tracks
    class MapsData < TrackData
      private

      def init_points
        @points = Points.new(@track).trimmed.map do |x|
          { latitude: x[:latitude], longitude: x[:longitude], h_speed: x[:h_speed] }
        end
      end
    end
  end
end
