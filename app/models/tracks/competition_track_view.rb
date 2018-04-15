module Tracks
  class CompetitionTrackView
    include TrackViewBase, TrackPoints, PointsCropping

    def initialize(event_track, chart_preferences)
      @event_track = event_track
      @chart_preferences = chart_preferences
    end

    def time
      @time ||=
        if @event_track.round_discipline == 'time'
          @event_track.result
        else
          super
        end
    end

    def trajectory_distance
      distance_presenter.call(track_trajectory_distance)
    end

    def zero_wind_track_distance
      zero_wind_trajectory_distance
    end

    private

    attr_reader :event_track

    def track_elevation
      range_from - range_to
    end

    def track_distance
      if event_track.round_discipline == 'distance'
        event_track.result
      else
        straight_line_distance
      end
    end

    def track
      @track ||= event_track.track
    end

    def range_from
      @range_from ||= event_track.range_from
    end

    def range_to
      @range_to ||= event_track.range_to
    end

    def points
      @points ||= cropped_points(track_points, range_from, range_to)
    end
  end
end
