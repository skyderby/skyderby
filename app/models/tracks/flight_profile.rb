module Tracks
  class FlightProfile
    def initialize(track_id)
      @track = Track.find(track_id)
    end

    def points
      return [] unless track_points.many?

      track_points.map do |point|
        {
          x: Skyderby::Geospatial.distance(
            [start_point[:latitude], start_point[:longitude]],
            [point[:latitude], point[:longitude]]
          ).round(1),
          y: [start_point[:altitude] - point[:altitude], 0].max.round(1),
          h_speed: point[:h_speed].round,
          v_speed: point[:v_speed].round
        }
      end
    end

    private

    def start_point
      @start_point ||= track_points.first
    end

    def track_points
      @track_points ||= begin
          PointsQuery.execute(
            track,
            trimmed: true,
            freq_1hz: true,
            only: %i[altitude latitude longitude h_speed v_speed]
          )
        end
    end

    attr_reader :track
  end
end
