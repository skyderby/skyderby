class Track::PointSeries
  COLUMNS = %i[
    gps_time latitude longitude abs_altitude h_speed v_speed distance fl_time
    horizontal_accuracy vertical_accuracy speed_accuracy
  ].freeze
  VALUE_READERS = {
    gps_time: :gps_times, fl_time: :flight_times, abs_altitude: :altitudes, h_speed: :speeds, v_speed: :speeds
  }.freeze

  attr_reader :track

  def initialize(track)
    @track = track
  end

  def count = times.size

  def columns
    @columns ||= COLUMNS.index_with { |column| values(column) }
  end

  private

  def series = @series ||= track.point_arrays

  def times = @times ||= series ? series.gps_time.map(&:to_f) : []

  def values(column)
    return [] unless series

    send(VALUE_READERS.fetch(column, :floats), column)
  end

  def gps_times(_column) = times

  def flight_times(_column) = series.gps_time.map { |time| (time.to_r - series.first_epoch).to_f }

  def altitudes(_column) = floats(track.abs_altitude? ? :abs_altitude : :elevation)

  def speeds(column) = floats(column).map { |value| value * Track::Points::MS_IN_KMH }

  def floats(column)
    values = series.public_send(column)
    values ? values.map { |value| value&.to_f } : Array.new(count)
  end
end
