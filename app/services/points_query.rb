class PointsQuery
  COLUMNS = %i[
    gps_time fl_time abs_altitude altitude latitude longitude h_speed v_speed full_speed distance
    time_diff glide_ratio horizontal_accuracy vertical_accuracy speed_accuracy
  ].freeze
  SOURCES = {
    gps_time: [], fl_time: [], time_diff: [],
    altitude: nil,
    full_speed: %i[h_speed v_speed], glide_ratio: %i[h_speed v_speed]
  }.freeze
  KMH_IN_MS = Track::Points::MS_IN_KMH
  DERIVED_COLUMNS = %i[gps_time fl_time time_diff altitude h_speed v_speed full_speed glide_ratio].freeze

  def initialize(track, opts = {})
    @track = track
    @columns = opts[:only] ? opts[:only].map(&:to_sym) & COLUMNS : COLUMNS
    @freq_1hz = opts[:freq_1hz] || false
    @trimmed = opts[:trimmed] || false
  end

  def execute
    return [] unless series

    previous = nil
    indexes.map do |index|
      row(index, previous).tap { previous = index }
    end
  end

  class << self
    def execute(...) = new(...).execute
  end

  private

  attr_reader :track, :columns, :freq_1hz, :trimmed

  def series
    return @series if defined?(@series)

    @series = Track::Points.select(:track_id, *source_columns).find_by(track_id: track.id)
  end

  def source_columns
    columns.flat_map { |column| SOURCES.fetch(column) { [column] } || [altitude_column] }.push(:gps_time).uniq
  end

  def altitude_column = track.abs_altitude? ? :abs_altitude : :elevation

  def times = @times ||= series.gps_time.map(&:to_f)

  def indexes
    range = trimmed_range
    selected = (0...times.size).select { |index| range.nil? || range.cover?(times[index]) }
    freq_1hz ? selected.uniq { |index| times[index].floor } : selected
  end

  def trimmed_range
    return unless trimmed && track.exit_epoch && track.deploy_epoch

    options = trimmed.is_a?(Hash) ? trimmed.with_indifferent_access : {}
    from = track.exit_epoch.to_f - options[:seconds_before_start].to_f
    to = track.deploy_epoch.to_f + options[:seconds_after_end].to_f
    from..to
  end

  def row(index, previous)
    columns.each_with_object(ActiveSupport::HashWithIndifferentAccess.new) do |column, row|
      row[column] = value(column, index, previous)
    end
  end

  def value(column, index, previous)
    return series.public_send(column)&.[](index) unless DERIVED_COLUMNS.include?(column)

    send(:"#{column}_at", index, previous)
  end

  def gps_time_at(index, _previous) = series.gps_time[index].utc

  def fl_time_at(index, _previous) = (series.gps_time[index].to_r - series.gps_time.first.to_r).to_f

  def time_diff_at(index, previous) = previous ? series.gps_time[index] - series.gps_time[previous] : 0

  def h_speed_at(index, _previous) = kmh(:h_speed, index)

  def v_speed_at(index, _previous) = kmh(:v_speed, index)

  def full_speed_at(index, _previous) = Math.sqrt((kmh(:h_speed, index)**2) + (kmh(:v_speed, index)**2))

  def glide_ratio_at(index, _previous)
    h_speed = kmh(:h_speed, index)
    v_speed = kmh(:v_speed, index)
    v_speed.zero? ? h_speed / 0.1 : h_speed / v_speed.abs
  end

  def altitude_at(index, _previous)
    return series.elevation&.[](index) unless track.abs_altitude?

    abs_altitude = series.abs_altitude&.[](index)
    abs_altitude && (abs_altitude - track.msl_offset.to_f)
  end

  def kmh(column, index) = series.public_send(column)[index] * KMH_IN_MS
end
