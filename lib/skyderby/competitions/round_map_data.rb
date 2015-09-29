module Skyderby
  module Competitions
    class RoundMapData
      def initialize
        @tracks = {}
      end

      def execute(round)
        round.event_tracks.each do |event_track|
          track = Track.find(event_track.track_id)
          points = Skyderby::Tracks::Points.new(track)
                   .trimmed
                   .reverse
                   .drop_while { |x| x[:elevation] < 1000 }
                   .reverse
                   .map do |x|
                     {
                       gps_time: x[:gps_time],
                       latitude: x[:latitude],
                       longitude: x[:longitude],
                       altitude: x[:elevation]
                     }
                   end

          @tracks[event_track.competitor_id] = { points: points }
        end

        @tracks
      end
    end
  end
end
