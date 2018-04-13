module Tracks
  class TrackView
    include TrackViewBase, TrackPoints, PointsCropping

    attr_reader :track

    class << self
      def for(track, params, session)
        view_class =
          if track.flysight? || track.cyber_eye?
            self
          else
            Tracks::RawTrackView
          end

        view_class.new(
          track,
          TrackRange.new(track, from: params[:f], to: params[:t]),
          ChartsPreferences.new(session)
        )
      end
    end

    def initialize(track, range, chart_preferences)
      @track = track
      @range_from = range.from
      @range_to = range.to
      @chart_preferences = chart_preferences
    end

    def min_altitude
      altitude_presenter.call(track.altitude_bounds[:min_altitude])
    end

    def max_altitude
      altitude_presenter.call(track.altitude_bounds[:max_altitude])
    end

    def range_from
      altitude_presenter.call(@range_from)
    end

    def range_to
      altitude_presenter.call(@range_to)
    end

    private

    def track_elevation
      @range_from - @range_to
    end

    def track_distance
      track_trajectory_distance
    end

    def zero_wind_track_distance
      zero_wind_trajectory_distance
    end

    def points
      @points ||= cropped_points(track_points, @range_from, @range_to)
    end
  end
end
