require 'matrix'

module JumpRangeFinder
  class Processor
    SEARCH_SECONDS = 5
    SECONDS_BEFORE = 2

    def initialize(threshold)
      @threshold = threshold
    end

    def call(points)
      @points = points

      return JumpRange.new(points.first, points.first) unless points.many?
      JumpRange.new(
        start_point,
        end_point,
        deploy_point
      )
    end

    private

    attr_reader :points, :threshold

    def start_point
      @start_point ||= find_start_point
    end

    def end_point
      @end_point ||= find_end_point
    end

    def deploy_point
      @deploy_point ||= find_deploy_point
    end

    def find_start_point
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

    def find_end_point
      scan_range = []
      points.reverse_each do |point|
        scan_range << point
        next if scan_range.first.gps_time - scan_range.last.gps_time < SEARCH_SECONDS

        break if end_range_found(scan_range)
        scan_range.shift
      end

      scan_range.first || points.last
    end

    def find_deploy_point
      # slice_size = (flight_range.size / 10).round
      # flight_range.each_slice(slice_size) do |slice|
      #
      # end
      first_point = flight_range.shift
      last_point = flight_range.pop

      distances = flight_range.map do |point|
        {
          distance: distance_to_line(point, line: [first_point, last_point]),
          point: point
        }
      end

      distances.max_by { |el| el[:distance] }[:point]
    end

    def distance_to_line(point, line:)
      x0 = point.fl_time
      y0 = point.abs_altitude
      x1 = line.first.fl_time
      y1 = line.first.abs_altitude
      x2 = line.last.fl_time
      y2 = line.last.abs_altitude

      triangle_square = ((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - x1 * y2).abs
      line_length = Math.sqrt((y2 - y1)**2 + (x2 - x1)**2)

      triangle_square / line_length
    end

    def start_range_found(scan_range)
      filtered_range = MedianFilter.new(
        scan_range,
        window_size: 5,
        keys: :v_speed
      ).execute

      filtered_range.all? { |x| x.v_speed > threshold }
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

    def flight_range
      @flight_range ||= points.delete_if do |point|
        !(start_point.fl_time..end_point.fl_time).cover? point.fl_time
      end
    end
  end
end
