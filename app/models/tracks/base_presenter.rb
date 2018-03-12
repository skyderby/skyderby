module Tracks
  class BasePresenter
    include ChartPreferences
    include WindCancellation
    include Summary, GlideRatioChart, SpeedsChart, ElevationDistanceChart

    def initialize(track, range_from, range_to, chart_preferences)
      @track = track
      @range_from = range_from
      @range_to = range_to
      @chart_preferences = chart_preferences
    end

    def glide_ratio_presenter
      ValuePresenters::GlideRatio.new
    end

    def speed_presenter
      ValuePresenters::Speed.new(chart_preferences.preferred_units)
    end

    def altitude_presenter
      ValuePresenters::Altitude.new(chart_preferences.preferred_units)
    end

    def distance_presenter
      ValuePresenters::Distance.new(chart_preferences.preferred_units)
    end 

    def missing_ranges
      return [] if points.blank?

      MissingRangesPresenter.call(
        track.missing_ranges,
        points.first[:fl_time],
        points.last[:fl_time]
      )
    end

    protected

    attr_reader :track, :chart_preferences

    def track_elevation
      @range_from - @range_to
    end

    def track_distance
      track_trajectory_distance
    end

    def straight_line_distance
      TrackSegment.new([points.first, points.last]).distance
    end

    def track_trajectory_distance
      points.each_cons(2).inject(0) do |sum, pair|
        sum + TrackSegment.new(pair).distance
      end
    end

    def zero_wind_track_distance
      zero_wind_trajectory_distance
    end

    def zero_wind_trajectory_distance
      @zero_wind_trajectory_distance ||=
        zerowind_points.each_cons(2).inject(0) do |sum, pair|
          sum + TrackSegment.new(pair).distance
        end
    end

    def track_points
      @track_points ||= begin
        raw_points = PointsQuery.execute(track, trimmed: true, freq_1Hz: true)
        # in database speeds in km/h, here we need it in m/s
        raw_points.each do |point|
          point[:h_speed] /= 3.6
          point[:v_speed] /= 3.6
        end

        preprocess_points(raw_points)
      end
    end

    def preprocess_points(raw_points)
      raw_points
    end

    def points
      return track_points if track_points.blank? || track_points.length == 1

      @points ||= begin
        start_index = track_points.index { |x| x[:altitude] <= @range_from } || 0
        start_point = track_points[start_index]

        end_index = track_points.index { |x| x[:gps_time] > start_point[:gps_time] && x[:altitude] <= @range_to }
        end_index ||= track_points.count - 1
        end_point = track_points[end_index]

        result_array = []
        unless start_point[:altitude] == @range_from
          interpolated_start = interpolate_by_altitude(track_points[start_index - 1], start_point, @range_from)
          result_array += [interpolated_start]
        end

        if end_point[:altitude] == @range_to
          result_array += track_points[start_index..end_index]
        else
          result_array += track_points[start_index..(end_index - 1)]
          interpolated_end = interpolate_by_altitude(track_points[end_index - 1], track_points[end_index], @range_to)
          result_array += [interpolated_end]
        end

        result_array
      end
    end

    def interpolate_by_altitude(first, second, altitude)
      k = (first[:altitude] - altitude) / (first[:altitude] - second[:altitude])

      new_point = first.clone
      new_point[:altitude] = altitude
      [:gps_time, :fl_time, :latitude, :longitude, :h_speed, :v_speed, :distance].each do |key|
        new_point[key] = interpolate_field(first, second, key, k)
      end

      new_point
    end

    def interpolate_field(first, second, key, k)
      first[key] + (second[key] - first[key]) * k
    end
  end
end
