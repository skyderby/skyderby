module Tracks
  class GlobePresenter
    def initialize(track)
      @track = track
    end

    def pilot_name = track.pilot_name || track.name

    def start_time
      (points.first && points.first[:gps_time]) || track.recorded_at
    end

    def stop_time
      (points.last && points.last[:gps_time]) || track.recorded_at
    end

    def avg_heading
      headings = points.each_cons(2).map do |pair|
        Skyderby::Geospatial.bearing_between(
          pair.first[:latitude],
          pair.first[:longitude],
          pair.last[:latitude],
          pair.last[:longitude]
        )
      end

      headings.sum(0.0) / headings.size
    end

    def points
      @points ||=
        PointsQuery.execute(
          track,
          trimmed: { seconds_before_start: 5 },
          freq_1hz: true,
          only: %i[gps_time abs_altitude latitude longitude h_speed v_speed glide_ratio]
        )
    end

    def nearby_places
      return [] if points.empty?

      places = (Place.where.not(id: track.place_id) if track.place_id) || Place
      places.nearby(points.first, 10)
    end

    private

    attr_reader :track
  end
end
