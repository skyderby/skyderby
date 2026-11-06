require 'vincenty'

class Track::FlightMetrics
  START_VERTICAL_SPEED = Track::Result::Calculation::BASE_START_SPEED
  CHECKPOINTS = [4, 6, 8, 10].freeze
  PERFORMANCE_CHECKPOINTS = [10, 20, 30, 40, 50, 60].freeze
  PERFORMANCE_TASKS = %w[time distance speed].freeze
  FLARE_LEAD_SECONDS = 8
  FLARE_TAIL_SECONDS = 1
  GRAVITY = 9.81
  KMH = 3.6
  BEST_CONVERSION = 0.27
  BEST_CONVERSIONS = { 'base' => 0.27, 'skydive' => 0.31 }.freeze
  POINT_COLUMNS = %i[gps_time time_diff altitude latitude longitude h_speed v_speed glide_ratio].freeze
  WINDOW_ERRORS = [WindowRangeFinder::ValueOutOfRange, PathIntersectionFinder::IntersectionNotFound].freeze

  attr_reader :track, :window_spec

  def self.window_spec_for(part, finish_line: nil)
    case part&.discipline
    when 'distance_in_altitude' then { 'kind' => part.discipline, 'elevation' => part.parameter }
    when 'distance_in_time' then { 'kind' => part.discipline, 'duration' => part.parameter }
    when 'base_race' then finish_line && { 'kind' => part.discipline, 'finish_line' => finish_line }
    when *PERFORMANCE_TASKS then performance_spec(part)
    end
  end

  def self.performance_spec(part)
    from = part.parameter.to_i
    { 'kind' => part.discipline, 'performance' => true, 'from_altitude' => (from if from.positive?) }.compact
  end

  def self.performance_windows(year)
    [{ from_altitude: 3000, to_altitude: 2000 }].tap do |windows|
      windows << { from_altitude: 2500, to_altitude: 1500 } if year >= 2020
    end
  end

  def self.best_conversion(kind) = BEST_CONVERSIONS.fetch(kind.to_s, BEST_CONVERSION)

  def initialize(track, window_spec: nil, flare: true)
    @track = track
    @window_spec = window_spec
    @flare_enabled = flare
  end

  def to_h = { 'window' => window, 'flare' => flare }

  def window
    return @window if defined?(@window)

    @window = window_spec && build_window
  end

  def flare
    return @flare if defined?(@flare)

    @flare = @flare_enabled ? build_flare : nil
  end

  private

  def build_window
    segment = window_spec['performance'] ? performance_segment : base_segment
    return unless segment

    samples = window_samples(segment.points)
    return if samples.size < 2

    run_up = RunUp.new(window_points, segment.points.first) if window_spec['performance']
    window_summary(samples, segment, run_up)
  rescue *WINDOW_ERRORS
    nil
  end

  def base_segment
    WindowRangeFinder.new(window_points).execute(from_vertical_speed: START_VERTICAL_SPEED, **window_filter)
  end

  def performance_segment
    segments = performance_windows.filter_map do |window|
      WindowRangeFinder.new(window_points).execute(window)
    rescue *WINDOW_ERRORS
      nil
    end
    segments.max_by { |segment| segment.public_send(window_spec['kind']) }
  end

  def performance_windows
    chosen = window_spec['from_altitude']
    return [{ from_altitude: chosen, to_altitude: window_spec['to_altitude'] || (chosen - 1000) }] if chosen

    self.class.performance_windows(track.recorded_at.year)
  end

  def window_filter
    if window_spec['elevation'] then { elevation: window_spec['elevation'] }
    elsif window_spec['duration'] then { duration: window_spec['duration'] }
    else { until_cross_finish_line: window_spec['finish_line'] }
    end
  end

  def window_points = @window_points ||= scoring_points(trimmed: { seconds_before_start: 10 })

  def window_samples(points)
    start = points.first
    points.map do |point|
      {
        time: (point[:gps_time] - start[:gps_time]).to_f,
        lost: start[:altitude] - point[:altitude],
        distance: Vincenty.distance_between_points(start, point),
        h_speed: point[:h_speed],
        v_speed: point[:v_speed]
      }
    end
  end

  def window_summary(samples, segment, run_up)
    last = samples.last

    {
      'kind' => window_spec['kind'],
      'parameter' => window_spec['elevation'] || window_spec['duration'],
      'result' => window_result(segment),
      'elevation' => last[:lost].round(1),
      'duration' => last[:time].round(1),
      'distance' => last[:distance].round(1),
      'checkpoints' => checkpoints(samples),
      **performance_bounds(segment),
      **window_averages(samples, segment),
      **window_peaks(samples),
      **window_end(last),
      **window_profile(samples, run_up)
    }
  end

  def window_profile(samples, run_up)
    {
      'shape' => Shape.new(samples).to_h,
      'segments' => (Segments.new(samples).to_a if run_up),
      'run_up' => run_up&.to_h,
      'series' => (run_up&.samples.to_a + samples).map { |sample| window_row(sample) }
    }.compact
  end

  def window_end(last)
    { 'end_h_speed' => last[:h_speed].round, 'end_v_speed' => last[:v_speed].round,
      'end_glide' => glide(last).round(2) }
  end

  def window_result(segment)
    case window_spec['kind']
    when 'base_race', 'time' then segment.time.to_f.round(1)
    when 'speed' then segment.speed.round(1)
    else segment.distance.round(1)
    end
  end

  def performance_bounds(segment)
    return {} unless window_spec['performance']

    { 'from_altitude' => segment.start_altitude.round, 'to_altitude' => segment.end_altitude.round }
  end

  def window_averages(samples, segment)
    first = samples.first
    seconds = [segment.time.to_f, 0.1].max
    lost = samples.last[:lost]
    {
      'start_h_speed' => first[:h_speed].round, 'start_v_speed' => first[:v_speed].round,
      'avg_h_speed' => (samples.last[:distance] / seconds * KMH).round,
      'avg_v_speed' => (lost / seconds * KMH).round,
      'avg_glide' => (lost.positive? ? samples.last[:distance] / lost : 0).round(2)
    }
  end

  def window_peaks(samples)
    peak_glide = samples.select { |sample| sample[:time] >= 2 }.max_by { |sample| glide(sample) } || samples.last
    peak_v_speed = samples.max_by { |sample| sample[:v_speed] }

    {
      'peak_glide' => glide(peak_glide).round(2),
      'peak_glide_at' => peak_glide[:time].round(1),
      'peak_v_speed' => peak_v_speed[:v_speed].round,
      'peak_v_speed_at' => peak_v_speed[:time].round(1)
    }
  end

  def checkpoint_seconds = window_spec['performance'] ? PERFORMANCE_CHECKPOINTS : CHECKPOINTS

  def checkpoints(samples)
    checkpoint_seconds.each_with_object({}) do |second, result|
      sample = samples.find { |item| item[:time] >= second }
      next unless sample

      result[second.to_s] = {
        'lost' => sample[:lost].round,
        'distance' => sample[:distance].round,
        'h_speed' => sample[:h_speed].round,
        'v_speed' => sample[:v_speed].round,
        'glide' => glide(sample).round(2)
      }
    end
  end

  def window_row(sample)
    [sample[:time].round(2), sample[:lost].round(1), sample[:distance].round(1),
     sample[:h_speed].round(1), sample[:v_speed].round(1)]
  end

  def glide(sample) = sample[:h_speed] / [sample[:v_speed], 1].max

  def build_flare
    return unless track.wingsuit?

    points = scoring_points(trimmed: true)
    best = Tracks::FlaresDetector.call(points).max_by(&:altitude_gain)
    return unless best

    flare_summary(points, best)
  end

  def flare_summary(points, best)
    start = best.points.first
    top = best.higher_point

    {
      'gain' => best.altitude_gain.round(1),
      'duration' => best.gain_duration.to_f.round(1),
      'entry_h_speed' => start[:h_speed].round,
      **dive_metrics(points, start, best.altitude_gain),
      'top_h_speed' => top[:h_speed].round,
      'series' => flare_series(points, start, top)
    }
  end

  def dive_metrics(points, start, gain)
    lead = points.select { |point| (start[:gps_time] - point[:gps_time]).between?(0, FLARE_LEAD_SECONDS) }
    dive = lead.max_by { |point| point[:v_speed] }
    fastest_speed = total_speed(lead.max_by { |point| total_speed(point) })

    {
      'max_h_speed_before' => lead.pluck(:h_speed).max.round,
      'dive_v_speed' => dive[:v_speed].round,
      'dive_angle' => dive_angle(dive),
      'max_total_speed_before' => fastest_speed.round,
      'possible_gain' => possible_gain(fastest_speed).round(1),
      'efficiency' => efficiency(gain, fastest_speed)
    }
  end

  def flare_series(points, start, top)
    from = start[:gps_time] - FLARE_LEAD_SECONDS
    to = top[:gps_time] + FLARE_TAIL_SECONDS
    window = points.select { |point| point[:gps_time].between?(from, to) }

    window.map do |point|
      [(point[:gps_time] - start[:gps_time]).to_f.round(2), (point[:altitude] - start[:altitude]).round(1),
       point[:h_speed].round(1), point[:v_speed].round(1)]
    end
  end

  def scoring_points(trimmed:)
    PointsPostprocessor.for(track.gps_type).call(PointsQuery.execute(track, trimmed:, only: POINT_COLUMNS))
  end

  def total_speed(point) = Math.hypot(point[:h_speed], point[:v_speed])

  def efficiency(gain, speed_kmh)
    possible = possible_gain(speed_kmh)
    return unless possible.positive?

    [gain / possible, 1.0].min.round(3)
  end

  def dive_angle(point) = (Math.atan2(point[:v_speed], point[:h_speed]) * 180 / Math::PI).round

  def possible_gain(speed_kmh)
    ((speed_kmh / KMH)**2 / (2 * GRAVITY)) * self.class.best_conversion(track.kind)
  end
end
