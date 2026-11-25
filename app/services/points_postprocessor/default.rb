module PointsPostprocessor
  class Default
    FILTER_WINDOW_SIZE = 5
    MOVING_AVG_WINDOW_SIZE = 7

    def self.call(points, speed_units: :ms)
      new(points, speed_units: speed_units).call
    end

    def initialize(points, speed_units: :ms)
      @points = points
      @speed_units = speed_units
    end

    def call
      return points if points.empty?

      speeds = points_with_neighbors.each_cons(FILTER_WINDOW_SIZE).map { |window| window_speeds(window) }
      h_speeds = moving_average(speeds.map(&:first))
      v_speeds = moving_average(speeds.map(&:last))

      points.each_with_index.map do |point, index|
        point.with(
          h_speed: h_speeds[index], v_speed: v_speeds[index],
          glide_ratio: Track::Points::Point.glide_ratio(h_speeds[index].to_f, v_speeds[index])
        )
      end
    end

    private

    attr_reader :points, :speed_units

    def points_with_neighbors
      ([points.first] * neighbors) + points + ([points.last] * neighbors)
    end

    def neighbors = FILTER_WINDOW_SIZE / 2

    def window_speeds(window)
      center = window[neighbors]
      time_between_points = window.last.gps_time - window.first.gps_time
      return [center.h_speed, center.v_speed] if time_between_points.zero?

      [
        speed_in_units(distance_in_window(window) / time_between_points),
        speed_in_units(altitude_changes_in_window(window) / time_between_points)
      ]
    end

    def speed_in_units(speed)
      Velocity.new(speed).convert_to(speed_units).to_f
    end

    def distance_in_window(window)
      window.each_cons(2).inject(0.0) do |sum, pair|
        sum + Skyderby::Geospatial.distance(
          [pair.last.latitude, pair.last.longitude],
          [pair.first.latitude, pair.first.longitude]
        )
      end
    end

    def altitude_changes_in_window(window)
      window.each_cons(2).inject(0.0) do |sum, pair|
        sum + (pair.first.altitude - pair.last.altitude).abs
      end
    end

    def moving_average(values) = MovingAverage.new(values, window_size: MOVING_AVG_WINDOW_SIZE).execute
  end
end
