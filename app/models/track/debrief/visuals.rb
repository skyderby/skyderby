class Track::Debrief::Visuals
  FLARE_LEAD = 3
  TYPICAL_EFFICIENCY = 0.6

  Subject = Data.define(:key, :name, :color, :self, :metrics, :track_id)

  attr_reader :subjects

  def initialize(subjects)
    @subjects = subjects
  end

  def replay(phase, moments)
    series = subjects.filter_map do |subject|
      rows = replay_rows(phase, subject.metrics)
      if rows.present?
        { 'name' => subject.name, 'track_id' => subject.track_id, 'color' => subject.color, 'self' => subject.self,
          'rows' => rows }
      end
    end
    return if series.empty?

    finish = series.map { |entry| entry['rows'].last.first }.max
    { 'phase' => phase, 'series' => series, 'moments' => moments.map { |moment| at_end(moment, finish) } }
  end

  def speed_loss
    rows = subjects.filter_map do |subject|
      flare = subject.metrics&.dig('flare')
      next unless flare && flare['max_h_speed_before'] && flare['entry_h_speed']

      { 'name' => subject.name, 'track_id' => subject.track_id, 'color' => subject.color,
        'top' => flare['max_h_speed_before'],
        'start' => flare['entry_h_speed'] }
    end
    rows.presence && { 'rows' => rows, 'range' => speed_range(rows) }
  end

  def flare_potential
    columns = subjects.filter_map { |subject| potential_column(subject) }
    columns.presence && { 'columns' => columns, 'scale' => ((columns.pluck('possible').max / 20.0).ceil * 20) }
  end

  def self.best_flare_height(speed_kmh)
    Track::FlightMetrics::BEST_CONVERSION * ((speed_kmh / Track::FlightMetrics::KMH)**2) /
      (2 * Track::FlightMetrics::GRAVITY)
  end

  def window_gap
    own, other = subjects.first(2)
    return unless other

    gaps = checkpoint_seconds(own, other).filter_map do |second|
      mine = lost_at(own, second)
      theirs = lost_at(other, second)
      { 'second' => second, 'gap' => (mine - theirs).round } if mine && theirs
    end
    gaps.presence && { 'other' => other.name, 'track_id' => other.track_id, 'color' => other.color, 'gaps' => gaps }
  end

  def self.flare_rows(rows)
    measured = with_distance(rows)
    origin = measured.min_by { |row| row[0].abs }[1]
    measured.select { |row| row[0] >= -FLARE_LEAD }
            .map { |time, x, altitude, h, v| [time, (x - origin).round(1), altitude, h, v] }
  end

  def self.with_distance(rows)
    distance = 0.0
    rows.each_cons(2).map do |previous, row|
      distance += (row[2] + previous[2]) / 2 / Track::FlightMetrics::KMH * (row[0] - previous[0])
      [row[0], distance, row[1], row[2], row[3]]
    end.unshift([rows[0][0], 0.0, rows[0][1], rows[0][2], rows[0][3]])
  end

  private

  def replay_rows(phase, metrics)
    rows = metrics&.dig(phase, 'series')
    return if rows.blank?
    return rows.map { |time, lost, distance, h, v| [time, distance, lost, h, v] } if phase == 'window'

    self.class.flare_rows(rows)
  end

  def checkpoint_seconds(own, other)
    keys = ->(subject) { subject.metrics&.dig('window', 'checkpoints')&.keys.to_a }
    (keys.call(own) & keys.call(other)).sort_by(&:to_i)
  end

  def potential_column(subject)
    flare = subject.metrics&.dig('flare')
    speed = flare&.dig('max_total_speed_before')
    return unless speed && flare['gain']

    possible = flare['possible_gain'] || self.class.best_flare_height(speed)
    { 'name' => subject.name, 'track_id' => subject.track_id, 'color' => subject.color, 'speed' => speed,
      'gain' => flare['gain'], 'possible' => possible.round(1), 'efficiency' => flare['efficiency'],
      'typical' => (possible * TYPICAL_EFFICIENCY).round(1) }
  end

  def lost_at(subject, second) = subject.metrics&.dig('window', 'checkpoints', second, 'lost')

  def at_end(moment, finish)
    moment.merge('t' => moment['t'] == 'end' ? finish : moment['t'].to_f)
  end

  def speed_range(rows)
    speeds = rows.flat_map { |row| [row['top'], row['start']] }
    [((speeds.min / 20).floor * 20) - 20, (speeds.max / 20.0).ceil * 20]
  end
end
