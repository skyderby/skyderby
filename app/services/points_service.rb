class PointsService
  def initialize(points)
    @points = points
  end

  def execute
    filter_by_freq!
    calc_parameters!

    @points
  end

  private

  # If track recorded with freq > 1Hz and time recorded without
  # fraction - treat track as 1Hz
  def filter_by_freq!
    @points.uniq!(&:gps_time)
  end

  # Calculate parameters that need prev point to it. Such as:
  # fl_time - time in seconds since start recording
  # h_speed - horizontal (grount) speed as distance / time since prev point
  # v_speed - vertical speed as altitude change since prev point / time
  def calc_parameters!
    @points.each_cons(2) do |prev_point, cur_point|
      fl_time_diff = cur_point.gps_time - prev_point.gps_time
      cur_point.fl_time = prev_point.fl_time + fl_time_diff

      cur_point.distance = Geospatial.distance_between_points(
        prev_point,
        cur_point
      )

      cur_point.h_speed ||=
        if fl_time_diff == 0
          prev_point.h_speed
        else
          Velocity.to_kmh(cur_point.distance / fl_time_diff)
        end

      cur_point.v_speed ||=
        if fl_time_diff == 0
          prev_point.v_speed
        else
          Velocity.to_kmh((prev_point.abs_altitude - point.abs_altitude) / fl_time_diff)
        end
    end
  end
end
