class Track::Points < ApplicationRecord
  class CopyMismatch < StandardError; end

  MS_IN_KMH = 3.6
  COLUMNS = %i[
    gps_time latitude longitude abs_altitude elevation distance h_speed v_speed
    horizontal_accuracy vertical_accuracy speed_accuracy
  ].freeze
  REQUIRED_COLUMNS = %i[gps_time latitude longitude distance h_speed v_speed].freeze
  ACCURACY_COLUMNS = %i[horizontal_accuracy vertical_accuracy speed_accuracy].freeze
  FLOAT_FINGERPRINTS = %i[abs_altitude elevation distance h_speed v_speed].freeze
  FINGERPRINT_COLUMNS = %w[size first_time last_time latitude longitude] + FLOAT_FINGERPRINTS.map(&:to_s)

  self.table_name = 'track_points'
  self.primary_key = 'track_id'

  belongs_to :track, inverse_of: :point_arrays

  attribute :gps_time, ArrayColumn::Time.new
  attribute :latitude, ArrayColumn::Decimal.new
  attribute :longitude, ArrayColumn::Decimal.new
  (FLOAT_FINGERPRINTS + ACCURACY_COLUMNS).each { |column| attribute column, ArrayColumn::Float.new }

  scope :restorable_from_files, lambda {
    joins(:track)
      .where(horizontal_accuracy: nil, tracks: { gps_type: :flysight })
      .where.not(tracks: { track_file_id: nil })
  }

  class << self
    def record(track, parsed_points)
      unique = parsed_points.uniq { |point| point.gps_time.to_f.round(3) }.sort_by { |point| point.gps_time.to_f }
      upsert(attributes_from(unique).merge(track_id: track.id), unique_by: :track_id) # rubocop:disable Rails/SkipsModelValidations
      track.reset_point_arrays
    end

    def attributes_from(parsed_points)
      COLUMNS.to_h do |column|
        values = parsed_points.map { |point| parsed_value(point, column) }
        [column, values.all?(&:nil?) && REQUIRED_COLUMNS.exclude?(column) ? nil : values]
      end
    end

    def copy_from_legacy!(track_ids)
      transaction do
        connection.exec_update(sanitize_sql([copy_sql, track_ids]))
        mismatched = mismatched_legacy_ids(track_ids)
        raise CopyMismatch, "Points mismatch for tracks #{mismatched.join(', ')}" if mismatched.any?
      end
    end

    def mismatched_legacy_ids(track_ids)
      connection.select_values(sanitize_sql([<<~SQL.squish, track_ids, track_ids]))
        SELECT COALESCE(legacy.track_id, copied.track_id)
        FROM (
          SELECT track_id, #{fingerprint_sql(time: 'gps_time_in_seconds', speed_divider: MS_IN_KMH)}
          FROM (#{unique_legacy_points_sql}) unique_points
          GROUP BY track_id
        ) legacy
        FULL JOIN (
          SELECT track_id, #{fingerprint_sql(time: 'extract(epoch FROM gps_time)')}
          FROM (#{unnested_points_sql}) unnested_points
          GROUP BY track_id
        ) copied ON copied.track_id = legacy.track_id
        WHERE ROW(#{qualified('legacy')}) IS DISTINCT FROM ROW(#{qualified('copied')})
           OR (legacy.vertical_accuracy IS NOT NULL
               AND legacy.vertical_accuracy IS DISTINCT FROM copied.vertical_accuracy)
      SQL
    end

    private

    def copy_sql
      <<~SQL.squish
        INSERT INTO track_points (track_id, #{COLUMNS.join(', ')})
        SELECT track_id,
               array_agg(to_timestamp(gps_time_in_seconds) ORDER BY gps_time_in_seconds),
               array_agg(latitude ORDER BY gps_time_in_seconds),
               array_agg(longitude ORDER BY gps_time_in_seconds),
               #{legacy_aggregate('abs_altitude')},
               #{legacy_aggregate('elevation')},
               array_agg(COALESCE(distance, 0) ORDER BY gps_time_in_seconds),
               array_agg(COALESCE(h_speed, 0) / #{MS_IN_KMH} ORDER BY gps_time_in_seconds),
               array_agg(COALESCE(v_speed, 0) / #{MS_IN_KMH} ORDER BY gps_time_in_seconds),
               #{ACCURACY_COLUMNS.map { |column| legacy_aggregate(column, cast: 'real') }.join(', ')}
        FROM (#{unique_legacy_points_sql}) unique_points
        GROUP BY track_id
        ON CONFLICT (track_id) DO NOTHING
      SQL
    end

    def unique_legacy_points_sql
      <<~SQL.squish
        SELECT DISTINCT ON (track_id, gps_time_in_seconds) *
        FROM points
        WHERE track_id IN (?) AND gps_time_in_seconds IS NOT NULL
        ORDER BY track_id, gps_time_in_seconds, id
      SQL
    end

    def fingerprint_sql(time:, speed_divider: nil)
      speed = ->(column) { speed_divider ? "COALESCE(#{column}, 0) / #{speed_divider}" : column }
      <<~SQL.squish
        count(*) AS size,
        round(min(#{time}), 3) AS first_time,
        round(max(#{time}), 3) AS last_time,
        sum(latitude) AS latitude,
        sum(longitude) AS longitude,
        round(sum(abs_altitude)::numeric, 3) AS abs_altitude,
        round(sum(elevation)::numeric, 3) AS elevation,
        round(sum(COALESCE(distance, 0))::numeric, 3) AS distance,
        round(sum(#{speed.call('h_speed')})::numeric, 3) AS h_speed,
        round(sum(#{speed.call('v_speed')})::numeric, 3) AS v_speed,
        round(sum(vertical_accuracy::real::float8)::numeric, 2) AS vertical_accuracy
      SQL
    end

    def qualified(table)
      FINGERPRINT_COLUMNS.map { |column| "#{table}.#{column}" }.join(', ')
    end

    def unnested_points_sql
      columns = %w[gps_time latitude longitude abs_altitude elevation distance h_speed v_speed vertical_accuracy]
      <<~SQL.squish
        SELECT track_id, point.*
        FROM track_points, unnest(#{columns.join(', ')}) AS point(#{columns.join(', ')})
        WHERE track_id IN (?)
      SQL
    end

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

    def legacy_aggregate(column, cast: 'float8')
      <<~SQL.squish
        CASE WHEN bool_or(#{column} IS NOT NULL)
             THEN array_agg(#{column}::#{cast} ORDER BY gps_time_in_seconds)
        END
      SQL
    end
  end

  def to_a
    columns = COLUMNS.map { |column| public_send(column) }
    Array.new(size) { |index| Point.new(*columns.map { |values| values&.[](index) }) }
  end

  delegate :size, to: :gps_time

  def point(index) = Point.new(*COLUMNS.map { |column| public_send(column)&.[](index) })

  def point_at(epoch)
    point(gps_time.bsearch_index { |time| time.to_r >= epoch } || (size - 1))
  end

  def first_epoch = gps_time.first&.to_r

  def min_abs_altitude(max_vertical_accuracy: nil)
    return if abs_altitude.nil?

    abs_altitude.each_index.filter_map do |index|
      accuracy = vertical_accuracy&.[](index)
      abs_altitude[index] if accuracy.nil? || max_vertical_accuracy.nil? || accuracy <= max_vertical_accuracy
    end.min
  end

  def restore_accuracy_from_file
    return false unless restorable_from_file?

    source = source_accuracy
    matches = gps_time.map { |time| source[time.to_f.round(3)] }
    return false if matches.none?

    update!(ACCURACY_COLUMNS.index_with { |column| accuracy_values(matches, column) })
  end

  private

  def restorable_from_file?
    horizontal_accuracy.nil? && track.flysight? && track.track_file&.file&.attached?
  end

  def source_accuracy
    TrackParser::Flysight.new(file: track.track_file.source).parse.index_by { |point| point.gps_time.to_f.round(3) }
  end

  def accuracy_values(matches, column)
    values = matches.map { |point| point&.public_send(column)&.to_f }
    values.all?(&:nil?) ? nil : values
  end
end
