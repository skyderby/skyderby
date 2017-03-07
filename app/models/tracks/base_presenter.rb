class Tracks::BasePresenter
  attr_reader :speed_units, :distance_units, :altitude_units

  def initialize(track, range_from, range_to, speed_units, distance_units, altitude_units)
    @track = track
    @range_from = range_from
    @range_to = range_to
    @speed_units = speed_units
    @distance_units = distance_units
    @altitude_units = altitude_units
  end

  def elevation
    altitude_presentation(track_elevation)
  end

  def time
    return 0.0 if points.blank?
    (points.last[:gps_time] - points.first[:gps_time]).round(1)
  end

  def glide_ratio
    return nil if track_elevation.zero?
    (track_distance.to_d / track_elevation.to_d).round(2)
  end

  def min_glide_ratio
    return 0.0 if points.blank?

    point = points.min_by { |x| x[:glide_ratio] }
    glide_ratio_presentation(point[:glide_ratio])
  end

  def max_glide_ratio
    return 0.0 if points.blank?

    point = points.max_by { |x| x[:glide_ratio] }
    if point[:glide_ratio] < 10
      glide_ratio_presentation(point[:glide_ratio])
    else
      '≥10'
    end
  end

  def avg_vertical_speed
    return nil if time.zero?
    speed_presentation(track_elevation / time)
  end

  def min_vertical_speed
    return 0.0 if points.blank?

    point = points.min_by { |x| x[:v_speed] }
    speed_presentation(point[:v_speed])
  end

  def max_vertical_speed
    return 0.0 if points.blank?

    point = points.max_by { |x| x[:v_speed] }
    speed_presentation(point[:v_speed])
  end

  def avg_horizontal_speed
    return nil if time.zero?
    speed_presentation(track_distance / time)
  end

  def min_horizontal_speed
    return 0.0 if points.blank?

    point = points.min_by { |x| x[:h_speed] }
    speed_presentation(point[:h_speed])
  end

  def max_horizontal_speed
    return 0.0 if points.blank?

    point = points.max_by { |x| x[:h_speed] }
    speed_presentation(point[:h_speed])
  end

  def glide_ratio_chart_line
    points.map do |x|
      {
        'x' => (x[:gps_time] - min_gps_time).round(1),
        'y' => y_for_glide_ratio(x[:glide_ratio]),
        'true_value' => glide_ratio_presentation(x[:glide_ratio])
      }
    end.to_json.html_safe
  end

  def altitude_chart_line
    points.map do |x|
      [(x[:gps_time] - min_gps_time).round(1), altitude_presentation(x[:altitude])]
    end.to_json
  end

  def ground_speed_chart_line
    points.map do |x|
      [(x[:gps_time] - min_gps_time).round(1), speed_presentation(x[:h_speed])]
    end.to_json
  end

  def vertical_speed_chart_line
    points.map do |x|
      [(x[:gps_time] - min_gps_time).round(1), speed_presentation(x[:v_speed])]
    end.to_json
  end

  def full_speed_chart_line
    points.map do |x|
      full_speed = Math.sqrt(x[:v_speed]**2 + x[:h_speed]**2)
      [(x[:gps_time] - min_gps_time).round(1), speed_presentation(full_speed)]
    end.to_json
  end

  def elevation_chart_line
    return [] if points.blank?

    max_altitude = points.first[:altitude]
    points.map do |x|
      [(x[:gps_time] - min_gps_time).round(1), altitude_presentation(max_altitude - x[:altitude])]
    end.to_json
  end

  def distance_chart_line
    tmp_distance = 0.0
    tmp_points = [points.first] + points
    tmp_points.each_cons(2).map do |pair|
      [
        (pair.last[:gps_time] - min_gps_time).round(1),
        distance_presentation(tmp_distance += TrackSegment.new(pair).distance)
      ]
    end.to_json
  end

  def wind_cancelation?
    weather_data.any?
  end

  def wind_effect_speed_chart_line
    zerowind_points.each_with_index.map do |point, index|
      [
        (point[:gps_time] - min_gps_time).round(1),
        speed_presentation(point[:h_speed]),
        speed_presentation(points[index][:h_speed])
      ]
    end.to_json
  end

  def wind_effect_glide_ratio_chart_line
    zerowind_points.each_with_index.map do |point, index|
      {
        'x' => (point[:gps_time] - min_gps_time).round(1),
        'low' => y_for_glide_ratio(point[:glide_ratio]),
        'high' => y_for_glide_ratio(points[index][:glide_ratio]),
        'true_value' => glide_ratio_presentation(point[:glide_ratio])
      }
    end.to_json.html_safe
  end

  protected

  attr_reader :range_from, :range_to, :track

  def track_elevation
    range_from - range_to
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

  def zero_wind_trajectory_distance
    zerowind_points.each_cons.inject(0) do |sum, pair|
      sum + TrackSegment.new(pair).distance
    end
  end

  def speed_presentation(value)
    Velocity.new(value).convert_to(speed_units).round.truncate
  end

  def distance_presentation(value)
    converted = Distance.new(value).convert_to(distance_units)
    if distance_units == 'mi'
      converted.round(2).to_f
    else
      converted.round.truncate
    end
  end

  def altitude_presentation(value)
    Distance.new(value).convert_to(altitude_units).round.truncate
  end

  def glide_ratio_presentation(value)
    value.round(2)
  end

  def y_for_glide_ratio(value)
    if value.negative?
      0
    elsif value > 7
      7
    else
      value.round(2)
    end
  end

  def min_gps_time
    @min_gps_time ||= points.first[:gps_time]
  end

  def weather_data
    start_time = min_gps_time.beginning_of_hour
    @weather_data ||=
      if track.weather_data.any?
        track.weather_data
      elsif track.competitive? && track.event.weather_data.for_time(start_time).any?
        track.event.weather_data.for_time(start_time)
      elsif track.place && track.place.weather_data.for_time(start_time).any?
        track.place.weather_data.for_time(start_time)
      else
        []
      end
  end

  def zerowind_points
    return [] if weather_data.blank?

    @zerowind_points ||= begin
      points_for_subtraction = points.tap do |tmp|
        tmp.first[:time_diff] = 0
        tmp.each_cons(2) do |prev, cur|
          cur[:time_diff] = cur[:gps_time] - prev[:gps_time]
        end
      end
      wind_data = Skyderby::WindCancellation::WindData.new(weather_data)
      points_after_subtraction = Skyderby::WindCancellation::WindSubtraction.new(points_for_subtraction, wind_data).execute
      points_after_subtraction.each_cons(2) do |prev, cur|
        cur[:h_speed] = TrackSegment.new([prev, cur]).distance / cur[:time_diff]
        cur[:v_speed] = (prev[:altitude] - cur[:altitude]) / cur[:time_diff]
        cur[:glide_ratio] = cur[:h_speed] / (cur[:v_speed].zero? ? 0.1 : cur[:v_speed])
      end
      points_after_subtraction
    end
  end

  def track_points
    @track_points ||= begin
      raw_points =
        track
        .points.freq_1Hz.trimmed
        .pluck_to_hash(
          'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
          "#{track.point_altitude_field} AS altitude",
          :latitude,
          :longitude,
          'h_speed / 3.6 AS h_speed',
          'v_speed / 3.6 AS v_speed',
          :distance,
          'CASE WHEN v_speed = 0 THEN h_speed / 0.1
                ELSE h_speed / ABS(v_speed)
          END AS glide_ratio'
        )
      preprocess_points(raw_points)
    end
  end

  def preprocess_points(raw_points)
    raw_points
  end

  def points
    return track_points if track_points.blank?

    @points ||= begin
      start_index = track_points.index { |x| x[:altitude] <= range_from }
      start_point = track_points[start_index]
      end_index = track_points.index { |x| x[:gps_time] > start_point[:gps_time] && x[:altitude].truncate <= range_to }
      end_point = track_points[end_index]

      result_array = []
      unless start_point[:altitude] == range_from
        interpolated_start = interpolate_by_altitude(track_points[start_index - 1], start_point, range_from)
        result_array += [interpolated_start]
      end

      if end_point[:altitude] == range_to
        result_array += track_points[start_index..end_index]
      else
        result_array += track_points[start_index..(end_index - 1)]
        interpolated_end = interpolate_by_altitude(track_points[end_index - 1], track_points[end_index], range_to)
        result_array += [interpolated_end]
      end

      result_array
    end
  end

  def interpolate_by_altitude(first, second, altitude)
    k = (first[:altitude] - altitude) / (first[:altitude] - second[:altitude])

    new_point = first.clone
    new_point[:altitude] = altitude
    [:gps_time, :latitude, :longitude, :h_speed, :v_speed, :distance].each do |key|
      new_point[key] = interpolate_field(first, second, key, k)
    end

    new_point
  end

  def interpolate_field(first, second, key, k)
    first[key] + (second[key] - first[key]) * k
  end
end
