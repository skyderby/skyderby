module PointsPostprocessor
  class Default
    FILTER_WINDOW_SIZE = 5
    MOVING_AVG_WINDOW_SIZE = 7
    MOVING_AVG_KEYS = [:h_speed, :v_speed].freeze

    def initialize(points, speed_units: :ms)
      @points = points
      @speed_units = speed_units
    end

    def execute
      tmp_points = process_by_distances(points)
      tmp_points = apply_moving_average(tmp_points)
      adjust_glide_ratio(tmp_points)
    end

    private

    attr_reader :points, :speed_units

    def process_by_distances(tmp_points)
      neighbors = (FILTER_WINDOW_SIZE / 2).floor
      temp = ([tmp_points.first] * neighbors) + tmp_points + ([tmp_points.last] * neighbors)

      temp.each_cons(FILTER_WINDOW_SIZE).map do |window|
        trajectory_distance = distance_in_window(window)
        altitude_diff = altitude_changes_in_window(window)
        time_between_points = window.last[:gps_time] - window.first[:gps_time]

        unless time_between_points.zero?
          window[neighbors][:h_speed] = speed_in_units(trajectory_distance / time_between_points)
          window[neighbors][:v_speed] = speed_in_units(altitude_diff / time_between_points)
        end

        window[neighbors]
      end
    end

    def speed_in_units(speed)
      Velocity.new(speed).convert_to(speed_units).to_f
    end

    def distance_in_window(window)
      window.each_cons(2).inject(0.0) do |sum, pair|
        sum + Skyderby::Geospatial.distance(
          [pair.last[:latitude], pair.last[:longitude]],
          [pair.first[:latitude], pair.first[:longitude]]
        )
      end
    end

    def altitude_changes_in_window(window)
      window.each_cons(2).inject(0.0) do |sum, pair|
        sum + (pair.first[:altitude] - pair.last[:altitude]).abs
      end
    end

    def apply_moving_average(tmp_points)
      MovingAverage.new(
        tmp_points,
        window_size: MOVING_AVG_WINDOW_SIZE,
        keys: MOVING_AVG_KEYS
      ).execute
    end

    def adjust_glide_ratio(tmp_points)
      tmp_points.each do |point|
        vertical_speed = point[:v_speed].zero? ? 0.1 : point[:v_speed].abs
        point[:glide_ratio] = (point[:h_speed].to_f / vertical_speed).to_f
      end
    end
  end
end
