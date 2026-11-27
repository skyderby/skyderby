class Track::Points < ApplicationRecord
  include Smoothing

  MS_IN_KMH = 3.6
  COLUMNS = %i[
    gps_time latitude longitude abs_altitude elevation distance h_speed v_speed
    horizontal_accuracy vertical_accuracy speed_accuracy
  ].freeze
  REQUIRED_COLUMNS = %i[gps_time latitude longitude distance h_speed v_speed].freeze
  ACCURACY_COLUMNS = %i[horizontal_accuracy vertical_accuracy speed_accuracy].freeze
  FLOAT_COLUMNS = %i[abs_altitude elevation distance h_speed v_speed].freeze

  self.table_name = 'track_points'
  self.primary_key = 'track_id'

  belongs_to :track, inverse_of: :point_arrays

  attribute :gps_time, ArrayColumn::Time.new
  attribute :latitude, ArrayColumn::Decimal.new
  attribute :longitude, ArrayColumn::Decimal.new
  (FLOAT_COLUMNS + ACCURACY_COLUMNS).each { |column| attribute column, ArrayColumn::Float.new }

  class << self
    def record(track, parsed_points)
      unique = parsed_points.uniq { |point| point.gps_time.to_f.round(3) }.sort_by { |point| point.gps_time.to_f }
      upsert(attributes_from(unique).merge(track_id: track.id), unique_by: :track_id) # rubocop:disable Rails/SkipsModelValidations
      track.reset_point_arrays
    end

    def from_kmh(speed) = speed / MS_IN_KMH

    def to_kmh(speed) = speed * MS_IN_KMH

    def attributes_from(parsed_points)
      COLUMNS.to_h do |column|
        values = parsed_points.map { |point| parsed_value(point, column) }
        [column, values.all?(&:nil?) && REQUIRED_COLUMNS.exclude?(column) ? nil : values]
      end
    end

    private

    def parsed_value(point, column)
      value = point.try(column)
      return if value.nil?

      case column
      when :h_speed, :v_speed then Float(value.to_s) / MS_IN_KMH
      when :latitude, :longitude then BigDecimal(value.to_s)
      when :gps_time then value.round(3)
      else Float(value.to_s)
      end
    end
  end

  delegate :size, to: :gps_time

  def points(trimmed: false, range: nil, freq_1hz: false)
    previous = nil
    indexes(range: range || trimmed_range(trimmed), freq_1hz:).map do |index|
      time_diff = previous ? gps_time[index] - gps_time[previous] : 0
      previous = index
      flight_point(index).with(time_diff:)
    end
  end

  def reload(...)
    @smoothed_points = nil
    super
  end

  def point(index, origin: first_epoch, with_altitude: true)
    Point.new(
      **timing_at(index, origin), **position_at(index, with_altitude), **speeds_at(index),
      **ACCURACY_COLUMNS.index_with { |column| public_send(column)&.[](index) }
    )
  end

  def point_at(epoch)
    return if size.zero?

    first_at_or_after = gps_time.bsearch_index { |time| time.to_r >= epoch }
    point(first_at_or_after || (size - 1), with_altitude: false)
  end

  def first_epoch = gps_time.first&.to_r

  def min_abs_altitude(max_vertical_accuracy: nil)
    return if abs_altitude.nil?

    abs_altitude.each_index.filter_map do |index|
      accuracy = vertical_accuracy&.[](index)
      abs_altitude[index] if accuracy.nil? || max_vertical_accuracy.nil? || accuracy <= max_vertical_accuracy
    end.min
  end

  private

  def indexes(range:, freq_1hz:)
    times = gps_time.map(&:to_r)
    selected = (0...size).select { |index| range.nil? || range.cover?(times[index]) }
    freq_1hz ? selected.uniq { |index| times[index].floor } : selected
  end

  def trimmed_range(trimmed)
    return unless trimmed && track.exit_epoch && track.deploy_epoch

    options = trimmed.is_a?(Hash) ? trimmed.with_indifferent_access : {}
    from = track.exit_epoch - options[:seconds_before_start].to_r
    to = track.deploy_epoch + options[:seconds_after_end].to_r
    from..to
  end

  def timing_at(index, origin)
    {
      gps_time: gps_time[index].getutc,
      fl_time: (gps_time[index].to_r - origin).to_f,
      time_diff: 0
    }
  end

  def position_at(index, with_altitude)
    {
      latitude: latitude[index],
      longitude: longitude[index],
      distance: distance[index],
      abs_altitude: abs_altitude&.[](index),
      elevation: elevation&.[](index),
      altitude: (altitude_at(index) if with_altitude)
    }
  end

  def speeds_at(index)
    horizontal = h_speed[index]
    vertical = v_speed[index]
    {
      h_speed: horizontal,
      v_speed: vertical,
      full_speed: Math.hypot(horizontal, vertical),
      glide_ratio: Point.glide_ratio(horizontal, vertical)
    }
  end

  def altitude_at(index)
    return elevation&.[](index) unless track.abs_altitude?

    abs_altitude&.[](index)&.-(track.msl_offset.to_f)
  end
end
