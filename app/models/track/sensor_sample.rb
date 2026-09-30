class Track::SensorSample < ApplicationRecord
  SECONDS_BEFORE_EXIT = 60
  SECONDS_AFTER_LANDING = 60
  SECONDS_AFTER_DEPLOY = 300

  belongs_to :track, inverse_of: :sensor_samples

  def self.import(track)
    sensor_file = track.track_file&.sensor_file
    return unless sensor_file&.attached? && track.exited_at

    rows = rows_for(track, sensor_file)
    transaction do
      where(track:).delete_all
      insert_all!(rows) if rows.any? # rubocop:disable Rails/SkipsModelValidations
    end
  end

  def self.rows_for(track, sensor_file)
    range = time_range(track)
    SensorParser::Flysight2.new(StringIO.new(Zlib.gunzip(sensor_file.download))).samples.filter_map do |sample|
      next unless range.cover?(sample.gps_time)

      { track_id: track.id, gps_time_in_seconds: sample.gps_time, ax: sample.ax, ay: sample.ay, az: sample.az }
    end
  end

  def self.time_range(track)
    last_time =
      if track.landed_at
        track.landed_at.to_f + SECONDS_AFTER_LANDING
      else
        track.deployed_at.to_f + SECONDS_AFTER_DEPLOY
      end

    (track.exited_at.to_f - SECONDS_BEFORE_EXIT)..last_time
  end
  private_class_method :rows_for, :time_range
end
