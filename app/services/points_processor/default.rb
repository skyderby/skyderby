module PointsProcessor
  class Default
    def initialize(points)
      @points = points
    end

    def execute
      before_calculation
      calculate_additional_params
    end

    private

    # template method
    def before_calculation; end

    def calculate_additional_params
      points.each_cons(2) do |prev_point, cur_point|
        process_pair_points(prev_point, cur_point)
      end

      points
    end

    def process_pair_points(prev_point, cur_point)
      calc_fl_time(prev_point, cur_point)
      calc_distance(prev_point, cur_point)
      additional_processing(prev_point, cur_point)
    end

    def calc_fl_time(prev_point, cur_point)
      fl_time_diff = cur_point.gps_time - prev_point.gps_time
      cur_point.fl_time = prev_point.fl_time + fl_time_diff
    end

    def calc_distance(prev_point, cur_point)
      cur_point.distance = Skyderby::Geospatial.distance_between_points(
        prev_point,
        cur_point
      )
    end

    # template method
    def additional_processing(prev_point, cur_point); end

    attr_reader :points
  end
end
