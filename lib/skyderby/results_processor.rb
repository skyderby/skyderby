module Skyderby
  class ResultsProcessor
    # Tasks and processors
    TASKS = {
      # Skydive
      distance:         Skyderby::ResultsProcessors::Distance,
      speed:            Skyderby::ResultsProcessors::Speed,
      time:             Skyderby::ResultsProcessors::Time,
      # BASE
      distance_in_time: Skyderby::ResultsProcessors::DistanceInTime,
      time_until_line:  Skyderby::ResultsProcessors::TimeUntilIntersection
    }.freeze

    # track_points
    # discipline - type should be sym
    # params - hash with discipline specific params
    def initialize(track_points, discipline, opts = {})
      @track_points = track_points
      @discipline   = discipline
      @opts         = opts
    end

    def execute
      TASKS[@discipline].new(@track_points, @opts).calculate
    end
  end
end
