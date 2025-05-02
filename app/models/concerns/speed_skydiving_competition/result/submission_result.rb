module SpeedSkydivingCompetition::Result::SubmissionResult
  extend ActiveSupport::Concern

  included do
    before_create :calculate_result
  end

  def calculate_result
    scoring = ResultScore.new(self)
    best_range = scoring.calculate

    if best_range
      assign_attributes(
        result: best_range[:speed] * 3.6,
        exit_altitude: scoring.exit_altitude,
        window_start_time: best_range.dig(:start_point, :gps_time),
        window_start_altitude: best_range.dig(:start_point, :altitude),
        window_end_time: best_range.dig(:end_point, :gps_time),
        window_end_altitude: best_range.dig(:end_point, :altitude)
      )
    else
      assign_attributes(
        result: nil,
        exit_altitude: nil,
        window_start_time: nil,
        window_start_altitude: nil,
        window_end_time: nil,
        window_end_altitude: nil
      )
    end
  end

  class ResultScore
    delegate :track, to: :result

    V_SPEED_THRESHOLD = 36 # km/h
    BREAKOFF_ALTITUDE = 1707 # 5600 ft
    WINDOW = 2256 # 7400 ft
    LOOKUP_TIME = 3

    def initialize(result)
      @result = result
    end

    def calculate
      ranges.max_by { |range| range[:speed] }
    end

    def exit_altitude = exit_point[:altitude]

    private

    attr_reader :result

    def ranges
      window_points
        .filter_map { |start_point| build_range(start_point) }
    end

    def build_range(start_point)
      end_time = (start_point[:gps_time] + LOOKUP_TIME.seconds).iso8601(3)
      end_point = points_by_time[end_time]

      return until end_point # rubocop:disable Lint/UnreachableLoop

      average_speed = (start_point[:altitude] - end_point[:altitude]) / LOOKUP_TIME
      { start_point: start_point, end_point: end_point, speed: average_speed }
    end

    def points_by_time
      @points_by_time ||= window_points.index_by { |point| point[:gps_time].iso8601(3) }
    end

    def exit_point = window_points.first

    def window_points
      @window_points ||=
        WindowRangeFinder
        .new(points)
        .execute(
          from_vertical_speed: V_SPEED_THRESHOLD,
          elevation_with_breakoff: { altitude: WINDOW, breakoff: BREAKOFF_ALTITUDE }
        )
        .points
    end

    def points
      @points ||= PointsQuery.execute(track, trimmed: { seconds_before_start: 5 })
    end
  end
end
