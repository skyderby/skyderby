module Tracks
  class RawTrackPresenter < TrackPresenter

    FILTER_WINDOW_SIZE = 5
    MOVING_AVG_WINDOW_SIZE = 7
    MOVING_AVG_KEYS = [:h_speed, :v_speed]

    def load
      @points = track_points
      filter_data!
      @points = trim_points_by_range(@points)
      @track_elevation = @range_from - @range_to
    end

    private

    def filter_data!
      process_by_distances!
      apply_moving_average!
      adjust_glide_ratio!
    end

    def process_by_distances!
      neighbors = (FILTER_WINDOW_SIZE / 2).floor
      temp = ([@points.first] * neighbors) + @points + ([@points.last] * neighbors)

      @points = temp.each_cons(FILTER_WINDOW_SIZE).map do |window|
        trajectory_distance = distance_in_window(window)
        altitude_diff = altitude_changes_in_window(window)
        time_between_points = window.last[:gps_time] - window.first[:gps_time]

        window[neighbors][:h_speed] = trajectory_distance / time_between_points
        window[neighbors][:v_speed] = altitude_diff / time_between_points

        window[neighbors]
      end
    end

    def distance_in_window(window)
      window.each_cons(2).inject(0.0) do |sum, pair|
        sum + Skyderby::Geospatial.distance(
          [pair.last[:latitude], pair.last[:longitude]],
          [pair.first[:latitude], pair.first[:longitude]],
        )
      end
    end

    def altitude_changes_in_window(window)
      window.each_cons(2).inject(0.0) do |sum, pair| 
        sum + (pair.first[:altitude] - pair.last[:altitude]).abs
      end
    end

    def apply_moving_average!
      neighbors = (MOVING_AVG_WINDOW_SIZE / 2).floor
      temp = ([@points.first] * neighbors) + @points + ([@points.last] * neighbors)

      @points = temp.each_cons(MOVING_AVG_WINDOW_SIZE).map do |window|
        MOVING_AVG_KEYS.each do |key|
          window[neighbors][key] = window.map { |x| x[key] }.inject(0.0, :+) / MOVING_AVG_WINDOW_SIZE
        end
        window[neighbors]
      end
    end

    def adjust_glide_ratio!
      @points.each do |point|
        # p[:raw_gr] = p[:raw_v_speed] == 0 ? 0 : (p[:raw_h_speed] / p[:raw_v_speed]).round(2)

        vertical_speed = point[:v_speed].zero? ? 0.1 : point[:v_speed].abs
        point[:glide_ratio] = point[:h_speed].to_f / vertical_speed
      end
    end
  end
end
