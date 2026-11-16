class Track::SensorSeries < ApplicationRecord
  self.table_name = 'track_sensor_series'
  self.primary_key = 'track_id'

  belongs_to :track, inverse_of: :sensor_series

  attribute :gps_time, ArrayColumn::Time.new
  %i[ax ay az].each { |column| attribute column, ArrayColumn::Float.new }

  def self.record(track, samples)
    return where(track:).delete_all if samples.empty?

    upsert( # rubocop:disable Rails/SkipsModelValidations
      {
        track_id: track.id,
        gps_time: samples.map { |sample| Time.zone.at(sample.gps_time) },
        ax: samples.map(&:ax),
        ay: samples.map(&:ay),
        az: samples.map(&:az)
      },
      unique_by: :track_id
    )
  end

  def self.copy_from_legacy!(track_ids)
    transaction do
      connection.exec_update(sanitize_sql([<<~SQL.squish, track_ids]))
        INSERT INTO track_sensor_series (track_id, gps_time, ax, ay, az)
        SELECT track_id,
               array_agg(to_timestamp(gps_time_in_seconds) ORDER BY gps_time_in_seconds, id),
               array_agg(ax::real ORDER BY gps_time_in_seconds, id),
               array_agg(ay::real ORDER BY gps_time_in_seconds, id),
               array_agg(az::real ORDER BY gps_time_in_seconds, id)
        FROM track_sensor_samples
        WHERE track_id IN (?)
        GROUP BY track_id
        ON CONFLICT (track_id) DO NOTHING
      SQL
      mismatched = mismatched_legacy_ids(track_ids)
      if mismatched.any?
        raise Track::Points::CopyMismatch,
              "Sensor samples mismatch for tracks #{mismatched.join(', ')}"
      end
    end
  end

  def self.mismatched_legacy_ids(track_ids)
    connection.select_values(sanitize_sql([<<~SQL.squish, track_ids, track_ids]))
      SELECT COALESCE(legacy.track_id, copied.track_id)
      FROM (
        SELECT track_id, #{fingerprint_sql('gps_time_in_seconds')}
        FROM track_sensor_samples
        WHERE track_id IN (?)
        GROUP BY track_id
      ) legacy
      FULL JOIN (
        SELECT track_id, #{fingerprint_sql('extract(epoch FROM gps_time)')}
        FROM (
          SELECT track_id, sample.*
          FROM track_sensor_series, unnest(gps_time, ax, ay, az) AS sample(gps_time, ax, ay, az)
          WHERE track_id IN (?)
        ) unnested_samples
        GROUP BY track_id
      ) copied ON copied.track_id = legacy.track_id
      WHERE ROW(legacy.size, legacy.first_time, legacy.last_time, legacy.ax, legacy.ay, legacy.az)
            IS DISTINCT FROM ROW(copied.size, copied.first_time, copied.last_time, copied.ax, copied.ay, copied.az)
    SQL
  end

  def self.fingerprint_sql(time)
    <<~SQL.squish
      count(*) AS size,
      round(min(#{time}), 3) AS first_time,
      round(max(#{time}), 3) AS last_time,
      round(sum(ax::real::float8)::numeric, 3) AS ax,
      round(sum(ay::real::float8)::numeric, 3) AS ay,
      round(sum(az::real::float8)::numeric, 3) AS az
    SQL
  end
  private_class_method :fingerprint_sql

  def samples
    @samples ||= gps_time.each_index.map do |index|
      SensorParser::Flysight2::Sample.new(gps_time: gps_time[index].to_f, ax: ax[index], ay: ay[index], az: az[index])
    end
  end
end
