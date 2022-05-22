class OnlineCompetitionsService
  BASE_START_SPEED = 10

  def self.score_track(track)
    Track.transaction do
      track.delete_online_competitions_results

      competitions = VirtualCompetition.suitable_for(track)
      competitions.each do |competition|
        new(track, competition).score
      end
    end
  end

  def initialize(track, competition)
    @track = track
    @competition = competition
  end

  def score
    if competition.flare?
      score_flare
    else
      score_performance
      score_performance_wind_cancelled if track.skydive?
    end
  end

  private

  attr_reader :track, :competition

  def score_flare
    flares = Tracks::FlaresDetector.call(track_points)
    return unless flares.any?

    highest_flare = flares.max_by(&:altitude_gain)

    competition.results.create! \
      track: track,
      result: highest_flare.altitude_gain
  end

  def score_performance
    track_segment = best_track_segment

    return unless track_segment

    competition.results.create! \
      track: track,
      result: track_segment.public_send(competition.task),
      highest_gr: track_segment.max_gr,
      highest_speed: track_segment.max_ground_speed
  end

  def score_performance_wind_cancelled
    return unless track.place

    track_segment = best_track_segment_wind_cancelled
    return unless track_segment

    competition.results.create! \
      track: track,
      result: track_segment.public_send(competition.task),
      highest_gr: track_segment.max_gr,
      highest_speed: track_segment.max_ground_speed,
      wind_cancelled: true
  end

  def best_track_segment
    points = track_points(trimmed: { seconds_before_start: 10 })
    points = yield points if block_given?

    all_segments = competition_windows.map do |window|
      WindowRangeFinder.new(points).execute(window)
    rescue WindowRangeFinder::ValueOutOfRange, PathIntersectionFinder::IntersectionNotFound
      nil
    end

    if competition.results_sort_order == 'descending'
      all_segments.compact.max_by { |segment| segment.public_send(competition.task) }
    else
      all_segments.compact.min_by { |segment| segment.public_send(competition.task) }
    end
  end

  def best_track_segment_wind_cancelled
    best_track_segment do |points|
      return if points.empty?

      start_time = points.first[:gps_time].beginning_of_hour
      weather_data = track.place.weather_data.for_time(start_time)
      return if weather_data.empty?

      wind_data = WindCancellation::WindData.new(weather_data)
      WindCancellation::WindSubtraction.new(points, wind_data).execute
    end
  end

  def track_points(trimmed: true)
    raw_points = PointsQuery.execute(
      track,
      trimmed: trimmed,
      only: [:gps_time, :time_diff, :altitude, :latitude, :longitude, :h_speed, :v_speed, :glide_ratio]
    )

    PointsPostprocessor.for(track.gps_type).call(raw_points)
  end

  def competition_windows
    case competition.discipline
    when 'distance', 'speed', 'time'
      [{ from_altitude: 3000, to_altitude: 2000 }].tap do |windows|
        windows << { from_altitude: 2500, to_altitude: 1500 } if track.recorded_at.year >= 2020
      end
    when 'distance_in_time'
      [{ from_vertical_speed: BASE_START_SPEED, duration: competition.discipline_parameter }]
    when 'distance_in_altitude'
      [{ from_vertical_speed: BASE_START_SPEED, elevation: competition.discipline_parameter }]
    when 'base_race'
      [{ from_vertical_speed: BASE_START_SPEED, until_cross_finish_line: competition.finish_line }]
    end
  end
end
