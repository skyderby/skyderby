module Tracks
  class ExitPerformance
    def initialize(track_id)
      @track = Track.find(track_id)
    end

    def points
      return [] unless track_points.many?
      start_point = track_points.first
      track_points.map do |point|
        [
          Skyderby::Geospatial.distance(
            [start_point[:latitude], start_point[:longitude]],
            [point[:latitude], point[:longitude]]
          ).round(1),
          [start_point[:altitude] - point[:altitude], 0].max.round(1)
        ]
      end
    end

    private

    def track_points
      @track_points ||= begin
          PointsQuery.execute(
            track,
            trimmed: true,
            freq_1Hz: true,
            only: %i[altitude latitude longitude]
          )
        end
    end

    attr_reader :track
  end
end
