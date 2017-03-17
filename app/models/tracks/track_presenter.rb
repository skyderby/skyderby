module Tracks
  class TrackPresenter < BasePresenter
    attr_reader :track

    def initialize(trk, range = nil, chart_preferences)
      @track = trk

      super(track, range.from, range.to, chart_preferences)
    end

    def min_altitude
      altitude_presentation(track.altitude_bounds[:min_altitude])
    end

    def max_altitude
      altitude_presentation(track.altitude_bounds[:max_altitude])
    end

    def range_from
      altitude_presentation(@range_from)
    end

    def range_to
      altitude_presentation(@range_to)
    end

    private

    def track_distance
      track_trajectory_distance
    end
  end
end
