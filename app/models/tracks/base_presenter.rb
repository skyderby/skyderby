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

  def load
    @points = trim_points_by_range(track_points)
    @track_elevation = @range_from - @range_to
  end

  def elevation
    altitude_presentation(@track_elevation)
  end

  def time
    return 0.0 if @points.blank?
    (@points.last[:gps_time] - @points.first[:gps_time]).round(1)
  end

  def glide_ratio
    return nil if @track_elevation == 0
    (track_distance.to_d / @track_elevation.to_d).round(2)
  end

  def min_glide_ratio
    return 0.0 if @points.blank?

    point = @points.min_by { |x| x[:glide_ratio] }
    glide_ratio_presentation(point[:glide_ratio])
  end

  def max_glide_ratio
    return 0.0 if @points.blank?

    point = @points.max_by { |x| x[:glide_ratio] }
    if point[:glide_ratio] < 10
      glide_ratio_presentation(point[:glide_ratio])
    else
      '≥10'
    end
  end

  def avg_vertical_speed
    return nil if time == 0
    speed_presentation(@track_elevation / time)
  end

  def min_vertical_speed
    return 0.0 if @points.blank?

    point = @points.min_by { |x| x[:v_speed] }
    speed_presentation(point[:v_speed])
  end

  def max_vertical_speed
    return 0.0 if @points.blank?

    point = @points.max_by { |x| x[:v_speed] }
    speed_presentation(point[:v_speed])
  end

  def avg_horizontal_speed
    return nil if time == 0
    speed_presentation(track_distance / time)
  end

  def min_horizontal_speed
    return 0.0 if @points.blank?

    point = @points.min_by { |x| x[:h_speed] }
    speed_presentation(point[:h_speed])
  end

  def max_horizontal_speed
    return 0.0 if @points.blank?

    point = @points.max_by { |x| x[:h_speed] }
    speed_presentation(point[:h_speed])
  end

  def glide_ratio_chart_line
    @points.map do |x|
      {
        'x' => (x[:gps_time] - min_gps_time).round(1),
        'y' => y_for_glide_ratio(x[:glide_ratio]),
        'true_value' => glide_ratio_presentation(x[:glide_ratio])
      }
    end.to_json.html_safe
  end

  def altitude_chart_line
    @points.map do |x|
      [(x[:gps_time] - min_gps_time).round(1), altitude_presentation(x[:altitude])]
    end.to_json
  end

  def ground_speed_chart_line
    @points.map do |x|
      [(x[:gps_time] - min_gps_time).round(1), speed_presentation(x[:h_speed])]
    end.to_json
  end

  def vertical_speed_chart_line
    @points.map do |x|
      [(x[:gps_time] - min_gps_time).round(1), speed_presentation(x[:v_speed])]
    end.to_json
  end

  def full_speed_chart_line
    @points.map do |x|
      full_speed = Math.sqrt(x[:v_speed] ** 2 + x[:h_speed] ** 2)
      [(x[:gps_time] - min_gps_time).round(1), speed_presentation(full_speed)]
    end.to_json
  end

  def elevation_chart_line
    return [] if @points.blank?

    max_altitude = @points.first[:altitude]
    @points.map do |x|
      [(x[:gps_time] - min_gps_time).round(1), altitude_presentation(max_altitude - x[:altitude])]
    end.to_json
  end

  def distance_chart_line
    tmp_distance = 0.0
    tmp_points = [@points.first] + @points
    tmp_points.each_cons(2).map do |pair|
      [
        (pair.last[:gps_time] - min_gps_time).round(1),
        distance_presentation(tmp_distance += TrackSegment.new(pair).distance)
      ]
    end.to_json
  end

  protected

  def straight_line_distance
    TrackSegment.new([@points.first, @points.last]).distance
  end

  def track_trajectory_distance
    @points.each_cons(2).inject(0) do |sum, pair|
      sum + TrackSegment.new(pair).distance
    end
  end

  def speed_presentation(value)
    Velocity.new(value).convert_to(@speed_units).round.truncate
  end

  def distance_presentation(value)
    converted = Distance.new(value).convert_to(@distance_units)
    if @distance_units == 'mi'
      converted.round(2).to_f
    else
      converted.round.truncate
    end
  end

  def altitude_presentation(value)
    Distance.new(value).convert_to(@altitude_units).round.truncate
  end

  def glide_ratio_presentation(value)
    value.round(2)
  end

  def y_for_glide_ratio(value)
    if value < 0
      0
    elsif value > 7
      7
    else
      value
    end
  end

  def min_gps_time
    @min_gps_time ||= @points.first[:gps_time]
  end

  def track_points
    @track.points.freq_1Hz.trimmed
          .pluck_to_hash(
            'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
            "#{@track.point_altitude_field} AS altitude",
            :latitude,
            :longitude,
            'h_speed / 3.6 AS h_speed',
            'v_speed / 3.6 AS v_speed',
            :distance,
            'CASE WHEN v_speed = 0 THEN h_speed / 0.1
                  ELSE h_speed / ABS(v_speed)
            END AS glide_ratio'
          )
  end

  def trim_points_by_range(points)
    return points if points.blank?

    start_index = points.index { |x| x[:altitude] <= @range_from }
    start_point = points[start_index]
    end_index = points.index { |x| x[:gps_time] > start_point[:gps_time] && x[:altitude] <= @range_to }
    end_point = points[end_index]
    
    result_array = []
    unless start_point[:altitude] == @range_from
      interpolated_start = interpolate_by_altitude(points[start_index - 1], start_point, @range_from)
      result_array += [interpolated_start]
    end

    if end_point[:altitude] == @range_to
      result_array += points[start_index..end_index]
    else
      result_array += points[start_index..(end_index - 1)]
      interpolated_end = interpolate_by_altitude(points[end_index - 1], points[end_index], @range_to)
      result_array += [interpolated_end]
    end

    result_array
  end

  def interpolate_by_altitude(first, second, altitude)
    k = (first[:altitude] - altitude) / (first[:altitude] - second[:altitude])

    new_point = first.clone
    new_point[:altitude]  = altitude
    [:gps_time, :latitude, :longitude, :h_speed, :v_speed, :distance].each do |key|
      new_point[key] = interpolate_field(first, second, key, k)
    end

    new_point
  end

  def interpolate_field(first, second, key, k)
    first[key] + (second[key] - first[key]) * k
  end
end
