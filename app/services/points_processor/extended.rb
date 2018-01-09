module PointsProcessor
  class Extended < Default
    MS_IN_KMH = 3.6

    private

    def before_calculation
      filter_by_frequency
    end

    def filter_by_frequency
      points.uniq!(&:gps_time)
    end

    def additional_processing(prev_point, cur_point)
      cur_point.h_speed = calc_h_speed(prev_point, cur_point)
      cur_point.v_speed = calc_v_speed(prev_point, cur_point)
    end

    def calc_h_speed(prev_point, cur_point)
      fl_time_diff = cur_point.gps_time - prev_point.gps_time
      return prev_point.h_speed if fl_time_diff.zero?

      cur_point.distance / fl_time_diff * MS_IN_KMH
    end

    def calc_v_speed(prev_point, cur_point)
      fl_time_diff = cur_point.gps_time - prev_point.gps_time
      return prev_point.v_speed if fl_time_diff.zero?

      (prev_point.abs_altitude - cur_point.abs_altitude) / fl_time_diff * MS_IN_KMH
    end
  end
end
