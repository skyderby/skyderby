module Tracks
  class BaseRaceTrackView
    include TrackViewBase

    delegate :track, to: :base_race_track

    def initialize(base_race_track, chart_preferences)
      @base_race_track = base_race_track
      @chart_preferences = chart_preferences
    end

    private

    attr_reader :base_race_track

    def track_elevation
      return 0 if points.blank?

      points.first[:abs_altitude] - points.last[:abs_altitude]
    end

    def track_distance
      track_trajectory_distance
    end

    def zero_wind_track_distance
      zero_wind_trajectory_distance
    end

    def points
      @points ||=
        begin
          all_points = PointsQuery.execute(
            track,
            trimmed: { seconds_before_start: 20 },
            freq_1hz: true
          )

          # in database speeds in km/h, here we need it in m/s
          all_points.each do |point|
            point[:h_speed] /= 3.6
            point[:v_speed] /= 3.6
          end

          WindowRangeFinder
            .new(all_points)
            .execute(from_gps_time: base_race_track.start_time, duration: base_race_track.result)
            .points
        rescue WindowRangeFinder::ValueOutOfRange
          []
        end
    end
  end
end
