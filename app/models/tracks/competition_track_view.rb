module Tracks
  class CompetitionTrackView
    include TrackViewBase, TrackPoints, PointsCropping

    def initialize(event_result, chart_preferences)
      @event_result = event_result
      @chart_preferences = chart_preferences
    end

    def time
      @time ||=
        if @event_result.round_discipline == 'time'
          @event_result.result
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

    attr_reader :event_result

    def track_elevation
      range_from - range_to
    end

    def track_distance
      if event_result.round_discipline == 'distance'
        event_result.result
      else
        straight_line_distance
      end
    end

    def track
      @track ||= event_result.track
    end

    def range_from
      @range_from ||= event_result.range_from
    end

    def range_to
      @range_to ||= event_result.range_to
    end

    def points
      @points ||= cropped_points(track_points, range_from, range_to)
    end
  end
end
