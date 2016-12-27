module JumpRangeFinder
  class Base
    SEARCH_SECONDS = 5
    SECONDS_BEFORE = 2

    def initialize(points)
      @points = points
    end

    def execute
      JumpRange.new(start_point, end_point)
    end

    private

    def start_point
      scan_range = []
      points.each do |point|
        scan_range << point

        next if scan_range.last.gps_time - scan_range.first.gps_time < SEARCH_SECONDS
        break if start_range_found(scan_range)
        scan_range.shift
      end

      return points.first unless scan_range.first

      points.detect do |x|
        x.gps_time >= scan_range.first.gps_time - SECONDS_BEFORE
      end || points.first
    end

    def end_point
      scan_range = []
      points.reverse_each do |point|
        scan_range << point
        next if scan_range.first.gps_time - scan_range.last.gps_time < SEARCH_SECONDS

        break if end_range_found(scan_range)
        scan_range.shift
      end

      scan_range.first || points.last
    end

    def start_range_found(scan_range)
      filtered_range = MedianFilter.new(
        scan_range,
        window_size: 5,
        keys: :v_speed
      ).execute

      filtered_range.all? { |x| x.v_speed > 10 }
    end

    def end_range_found(scan_range)
      filtered_range = MovingAverage.new(
        scan_range,
        window_size: 5,
        keys: [:abs_altitude, :h_speed]
      ).execute

      filtered_range.each_cons(2).all? do |pair|
        pair.first.abs_altitude < pair.last.abs_altitude &&
          pair.last.h_speed > 10
      end
    end

    attr_reader :points
  end
end
