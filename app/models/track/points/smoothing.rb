module Track::Points::Smoothing
  extend ActiveSupport::Concern

  RAW_SPEED_FORMATS = %w[flysight flysight2].freeze
  FILTER_WINDOW_SIZE = 5
  MOVING_AVERAGE_WINDOW_SIZE = 7

  module ClassMethods
    def smooth(points)
      return points if points.empty?

      speeds = with_neighbors(points).each_cons(FILTER_WINDOW_SIZE).map { |window| window_speeds(window) }
      h_speeds = moving_average(speeds.map(&:first))
      v_speeds = moving_average(speeds.map(&:last))

      points.each_with_index.map { |point, index| with_speeds(point, h_speeds[index], v_speeds[index]) }
    end

    private

    def with_neighbors(points)
      neighbors = FILTER_WINDOW_SIZE / 2
      ([points.first] * neighbors) + points + ([points.last] * neighbors)
    end

    def window_speeds(window)
      center = window[FILTER_WINDOW_SIZE / 2]
      seconds = window.last.gps_time - window.first.gps_time
      return [center.h_speed, center.v_speed] if seconds.zero?

      [distance_in(window) / seconds, altitude_change_in(window) / seconds]
    end

    def distance_in(window)
      window.each_cons(2).sum(0.0) do |from, to|
        Skyderby::Geospatial.distance([to.latitude, to.longitude], [from.latitude, from.longitude])
      end
    end

    def altitude_change_in(window) = (window.first.altitude - window.last.altitude).to_f

    def moving_average(values)
      neighbors = MOVING_AVERAGE_WINDOW_SIZE / 2
      last = values.size - 1

      values.dup.tap do |averaged|
        averaged.each_index do |index|
          window = ((index - neighbors)..(index + neighbors)).map { |position| position.clamp(0, last) }
          averaged[index] = window.sum { |position| averaged[position] } / MOVING_AVERAGE_WINDOW_SIZE
        end
      end
    end

    def with_speeds(point, h_speed, v_speed)
      point.with(
        h_speed:, v_speed:, full_speed: Math.hypot(h_speed, v_speed),
        glide_ratio: Track::Points::Point.glide_ratio(h_speed.to_f, v_speed)
      )
    end
  end

  private

  def flight_point(index) = smoothed? ? smoothed_points[index] : point(index)

  def smoothed? = RAW_SPEED_FORMATS.exclude?(track.gps_type)

  def smoothed_points
    @smoothed_points ||= begin
      origin = first_epoch
      self.class.smooth(Array.new(size) { |index| point(index, origin:) })
    end
  end
end
