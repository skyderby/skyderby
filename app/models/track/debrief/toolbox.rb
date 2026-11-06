require 'vincenty'

class Track::Debrief::Toolbox
  PHASES = %w[window flare].freeze
  MAX_ROWS = 160

  DEFINITIONS = [
    {
      name: 'field_jump',
      description: 'Best jump of the pilot ranked N in the pooled field of this discipline. Call it to compare the ' \
                   'pilot with someone at a chosen position: the leader, the next place up, a pilot from the same ' \
                   'exit or with a similar suit. Returns results, points and the phase metrics summary.',
      input_schema: {
        type: 'object',
        properties: { rank: { type: 'integer', description: 'Rank in the field, 1 is the leader' } },
        required: ['rank']
      }
    },
    {
      name: 'jump_metrics',
      description: "Results and phase metrics summary of one jump: the pilot's own jumps this season or a field " \
                   "pilot's best jump. Call it to check a pilot's other jumps, for example the one with the best " \
                   'flare or the best distance.',
      input_schema: {
        type: 'object',
        properties: { track_id: { type: 'integer', description: 'Track id from the summary or another tool' } },
        required: ['track_id']
      }
    },
    {
      name: 'series',
      description: 'Time series of one phase of a jump, to look at the shape of a curve instead of a summary: ' \
                   'how fast the transition happens, whether glide holds or fades, how the dive builds before the ' \
                   'flare. window rows: [s from window start, m height lost, m distance from start, km/h horizontal, ' \
                   'km/h vertical]. flare rows: [s from climb start, m altitude relative to climb start, km/h ' \
                   'horizontal, km/h vertical].',
      input_schema: {
        type: 'object',
        properties: {
          track_id: { type: 'integer' },
          phase: { type: 'string', enum: PHASES },
          step: { type: 'number', description: 'Seconds between rows, 0.2 to 2. Default 1.' }
        },
        required: %w[track_id phase]
      }
    },
    {
      name: 'compare',
      description: 'Two jumps side by side in one phase, aligned by time from the phase start, with differences. ' \
                   'Call it when you want to see exactly where one jump gains on the other.',
      input_schema: {
        type: 'object',
        properties: {
          track_id: { type: 'integer', description: 'Usually the pilot jump' },
          other_track_id: { type: 'integer' },
          phase: { type: 'string', enum: PHASES },
          step: { type: 'number', description: 'Seconds between rows, 0.2 to 2. Default 1.' }
        },
        required: %w[track_id other_track_id phase]
      }
    },
    {
      name: 'course',
      description: 'Heading changes during the window of a jump, in degrees per second, to find turns or a line ' \
                   'that drifts. Rows: [s from window start, heading in degrees, change since previous row].',
      input_schema: {
        type: 'object',
        properties: { track_id: { type: 'integer' } },
        required: ['track_id']
      }
    },
    {
      name: 'moment',
      description: 'Where each jump is at one moment of a phase, to write the caption of a replay moment: height, ' \
                   'distance, horizontal, vertical and total speed in km/h, and how each speed changes over the ' \
                   'next second in m/s^2 (positive means growing). window: seconds from the window start, height ' \
                   'is metres lost. flare: seconds from the climb start (negative in the dive, from -3), height ' \
                   'is metres above the climb start, distance is metres from the climb start. vertical is ' \
                   'positive when sinking, negative when climbing.',
      input_schema: {
        type: 'object',
        properties: {
          track_ids: { type: 'array', items: { type: 'integer' } },
          phase: { type: 'string', enum: PHASES },
          at: { type: 'number', description: 'Seconds, see the description' }
        },
        required: %w[track_ids phase at]
      }
    },
    {
      name: 'what_if',
      description: "Projects what the pilot's jump would score with different results: points per part, total and " \
                   "the place it would take in the field, the pilot's current standing left out. Parts you omit " \
                   'keep the results of this jump. To estimate a flare from speed, give flare_total_speed and ' \
                   'flare_efficiency instead of a flare result: height = efficiency x best conversion x v^2 / 2g. ' \
                   'Use it to show the pilot what a change would give.',
      input_schema: {
        type: 'object',
        properties: {
          results: { type: 'object', additionalProperties: { type: 'number' },
                     description: 'Discipline key to result, for example {"distance_in_altitude": 300}' },
          flare_total_speed: { type: 'number', description: 'Highest total speed in the dive, km/h' },
          flare_efficiency: { type: 'number', description: 'Efficiency in percent, on the 0-100 scale' }
        }
      }
    }
  ].freeze

  class UnknownTrack < StandardError; end

  attr_reader :debrief, :evidence

  def initialize(debrief)
    @debrief = debrief
    @evidence = { 'calls' => [], 'tracks' => {} }
  end

  def definitions = DEFINITIONS

  def call(name, input)
    output = public_send("tool_#{name}", **input.to_h.symbolize_keys)
    evidence['calls'] << { 'name' => name, 'input' => input.to_h.stringify_keys }
    output
  rescue UnknownTrack
    { 'error' => 'This track is not in the field or among the pilot jumps.' }
  rescue ArgumentError, NoMethodError => e
    { 'error' => "Bad input: #{e.message[0, 120]}" }
  end

  def tool_field_jump(rank:)
    standing = field.standings.find { |item| item.rank == rank.to_i }
    return { 'error' => "No pilot at rank #{rank}. The field has #{field.standings.size} pilots." } unless standing

    jump_summary(standing.track_id).merge('rank' => standing.rank)
  end

  def tool_jump_metrics(track_id:) = jump_summary(track_id)

  def tool_series(track_id:, phase:, step: 1)
    rows = phase_series(track_id, phase)
    return { 'error' => "No #{phase} in this jump." } unless rows

    { 'track_id' => track_id.to_i, 'phase' => phase, 'rows' => thin(rows, step) }
  end

  def tool_compare(track_id:, other_track_id:, phase:, step: 1)
    rows = phase_series(track_id, phase)
    other = phase_series(other_track_id, phase)
    return { 'error' => "One of the jumps has no #{phase}." } unless rows && other

    { 'phase' => phase, 'columns' => compare_columns(phase), 'rows' => aligned(rows, other, step) }
  end

  def tool_course(track_id:)
    points = window_points(track_id)
    return { 'error' => 'No window in this jump.' } unless points

    { 'track_id' => track_id.to_i, 'rows' => course_rows(points) }
  end

  def tool_moment(track_ids:, phase:, at:)
    { 'phase' => phase, 'at' => at.to_f, 'jumps' => Array(track_ids).map { |id| moment_of(id.to_i, phase, at.to_f) } }
  end

  def tool_what_if(results: {}, flare_total_speed: nil, flare_efficiency: nil)
    estimate = flare_estimate(flare_total_speed, flare_efficiency)
    projected = projected_results(results.to_h.transform_keys(&:to_s), estimate)
    total = field.total_for(projected)

    { 'results' => results_hash(projected), 'total' => total.round(1), 'rank' => projected_rank(total),
      'current_total' => debrief.inputs.dig('jump', 'total'), 'current_rank' => debrief.inputs.dig('pilot', 'rank'),
      'flare_gain_estimate' => estimate&.round(1) }.compact
  end

  private

  def discipline = debrief.discipline

  def moment_of(track_id, phase, time)
    rows = replay_rows(track_id, phase)
    error = moment_error(rows, phase, time)
    return { 'track_id' => track_id, 'error' => error } if error

    now = interpolate(rows, time)
    ahead = [time + 1, rows.last[0]].min - time
    later = interpolate(rows, time + ahead) if ahead >= 0.2
    { 'track_id' => track_id, 'height' => now[2].round(1), 'distance' => now[1].round(1),
      'h_speed' => now[3].round, 'v_speed' => now[4].round, 'total_speed' => total(now).round,
      'change' => later && speed_changes(now, later, ahead) }.compact
  end

  def moment_error(rows, phase, time)
    return "No #{phase} in this jump." if rows.blank?

    "Outside the replay, which runs from #{rows.first[0]} to #{rows.last[0]} s." unless
      time.between?(rows.first[0], rows.last[0])
  end

  def replay_rows(track_id, phase)
    rows = phase_series(track_id, phase)
    return if rows.blank?
    return rows.map { |time, lost, distance, h, v| [time, distance, lost, h, v] } if phase == 'window'

    Track::Debrief::Visuals.flare_rows(rows)
  end

  def interpolate(rows, time)
    after = rows.index { |row| row[0] >= time } || (rows.size - 1)
    before = rows[[after - 1, 0].max]
    span = rows[after][0] - before[0]
    ratio = span.positive? ? (time - before[0]) / span : 0
    before.zip(rows[after]).map { |from, to| from + ((to - from) * ratio) }
  end

  def total(row) = Math.hypot(row[3], row[4])

  def speed_changes(now, later, seconds)
    rate = ->(from, to) { ((to - from) / Track::FlightMetrics::KMH / seconds).round(1) }
    { 'h_speed' => rate.call(now[3], later[3]), 'v_speed' => rate.call(now[4], later[4]),
      'total_speed' => rate.call(total(now), total(later)) }
  end

  def projected_rank(total)
    others = field.standings.reject { |standing| standing.profile_id == debrief.track.profile_id }
    others.count { |standing| standing.total > total } + 1
  end

  def projected_results(overrides, flare_gain)
    discipline.parts.map do |part|
      if part.discipline == 'flare' && flare_gain then flare_gain
      elsif overrides.key?(part.discipline) then overrides[part.discipline].to_f
      else debrief.inputs.dig('jump', 'results', part.discipline, 'result')
      end
    end
  end

  def flare_estimate(total_speed, efficiency)
    return unless total_speed && efficiency

    speed = total_speed.to_f / Track::FlightMetrics::KMH
    conversion = Track::FlightMetrics.best_conversion(debrief.track.kind)
    (efficiency.to_f / 100) * conversion * (speed**2) / (2 * Track::FlightMetrics::GRAVITY)
  end

  def field = @field ||= Track::Debrief::Field.new(discipline, year: debrief.track.recorded_at.year)

  def allowed_track_ids
    @allowed_track_ids ||= Set.new(
      field.standings.map(&:track_id) + field.pilot_jumps(debrief.track.profile_id).map(&:track_id) +
        [debrief.track.id]
    )
  end

  def track(track_id)
    raise UnknownTrack unless allowed_track_ids.include?(track_id.to_i)

    @tracks ||= {}
    @tracks[track_id.to_i] ||= Track.includes(:pilot, :suit, :place).find(track_id)
  end

  def metrics(track_id)
    @metrics ||= {}
    @metrics[track_id.to_i] ||= begin
      spec = Track::FlightMetrics.window_spec_for(discipline.window_part, finish_line: discipline.finish_line)
      Track::FlightMetrics.new(track(track_id), window_spec: spec, flare: discipline.flare_part.present?).to_h
    end
  end

  def jump_summary(track_id)
    jump = track(track_id)
    results = field.results_for(jump.id) || []
    summary = track_info(jump).merge(
      'results' => results_hash(results), 'total' => field.total_for(results).round(1),
      'metrics' => without_series(metrics(jump.id))
    )
    evidence['tracks'][jump.id.to_s] = summary.merge('metrics' => metrics(jump.id))
    summary
  end

  def track_info(jump)
    { 'track_id' => jump.id, 'pilot' => jump.pilot&.name, 'suit' => jump.suit&.name, 'place' => jump.place&.name,
      'date' => jump.recorded_at.to_date.iso8601, 'rank' => standing_rank(jump.id) }.compact
  end

  def standing_rank(track_id)
    field.standings.find { |standing| standing.track_id == track_id }&.rank
  end

  def results_hash(results)
    points = field.points_for(results)
    discipline.parts.each_with_index.to_h do |part, index|
      [part.discipline, { 'result' => results[index]&.round(1), 'points' => points[index]&.round(1) }]
    end
  end

  def without_series(metrics) = metrics.transform_values { |phase| phase&.except('series') }

  def phase_series(track_id, phase) = metrics(track_id).dig(phase, 'series')

  def thin(rows, step)
    step = step.to_f.clamp(0.2, 2.0)
    picked = []
    rows.each { |row| picked << row if picked.empty? || row.first - picked.last.first >= step - 0.01 }
    picked.last(MAX_ROWS)
  end

  def compare_columns(phase)
    if phase == 'window'
      %w[s lost_a lost_b distance_a distance_b h_a h_b v_a v_b]
    else
      %w[s altitude_a altitude_b h_a h_b v_a v_b]
    end
  end

  def aligned(rows, other, step)
    thin(rows, step).filter_map do |row|
      match = other.min_by { |candidate| (candidate.first - row.first).abs }
      next if (match.first - row.first).abs > 0.3

      [row.first, *row.drop(1).zip(match.drop(1)).flatten]
    end
  end

  def window_points(track_id)
    rows = phase_series(track_id, 'window')
    return unless rows

    jump = track(track_id)
    points = PointsPostprocessor.for(jump.gps_type).call(
      PointsQuery.execute(jump, trimmed: { seconds_before_start: 10 },
                                only: %i[gps_time time_diff altitude latitude longitude h_speed v_speed glide_ratio])
    )
    start = points.index { |point| point[:v_speed] >= Track::FlightMetrics::START_VERTICAL_SPEED }
    start && points[start, (rows.last.first * 5).ceil + 1]
  end

  def course_rows(points)
    start = points.first[:gps_time]
    headings = points.each_cons(5).map do |from, *, to|
      [(to[:gps_time] - start).to_f.round(1), bearing(from, to)]
    end
    headings.each_slice(5).map(&:first).each_cons(2).map do |(_, previous), (time, heading)|
      [time, heading.round, (((heading - previous + 540) % 360) - 180).round]
    end
  end

  def bearing(from, to)
    Skyderby::Geospatial.bearing_between(from[:latitude], from[:longitude], to[:latitude], to[:longitude])
  end
end
