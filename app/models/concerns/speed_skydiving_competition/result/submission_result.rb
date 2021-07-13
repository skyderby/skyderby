module SpeedSkydivingCompetition::Result::SubmissionResult
  extend ActiveSupport::Concern

  included do
    before_save :calculate_result
  end

  def calculate_result
    scoring = ResultScore.new(self)
    best_range = scoring.calculate
    return unless best_range

    assign_attributes \
      result: best_range[:speed] * 3.6,
      exit_altitude: scoring.exit_altitude,
      window_start_time: best_range.dig(:start_point, :gps_time),
      window_end_time: best_range.dig(:end_point, :gps_time)
  end

  class ResultScore
    delegate :track, to: :result

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
        .map { |start_point| build_range(start_point) }
        .compact
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

    def window_points
      @window_points ||=
        WindowRangeFinder
        .new(points)
        .execute(
          from_gps_time: exit_time,
          elevation_with_breakoff: { altitude: WINDOW, breakoff: BREAKOFF_ALTITUDE }
        )
        .points
    end

    def exit_time = exit_point[:gps_time]

    def exit_point
      gr_threshold = 10

      points
        .each_cons(15).find([points.first]) do |range|
          range.all? { |point| point[:glide_ratio] < gr_threshold }
        end
        .first
    end

    def points
      @points ||= PointsQuery.execute(
        track,
        trimmed: { seconds_before_start: 5 },
        only: %i[gps_time altitude glide_ratio]
      )
    end
  end
end
