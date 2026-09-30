class Track::SensorSample < ApplicationRecord
  SECONDS_BEFORE_EXIT = 60
  SECONDS_AFTER_LANDING = 60
  SECONDS_AFTER_DEPLOY = 300

  belongs_to :track, inverse_of: :sensor_samples

  def self.import(track)
    sensor_file = track.track_file&.sensor_file
    return unless sensor_file&.attached? && track.exited_at

    range = (track.exited_at.to_f - SECONDS_BEFORE_EXIT)..last_time(track)
    rows = SensorParser::Flysight2.new(StringIO.new(Zlib.gunzip(sensor_file.download))).samples
      .select { |sample| range.cover?(sample.gps_time) }
      .map { |sample| { track_id: track.id, gps_time_in_seconds: sample.gps_time, ax: sample.ax, ay: sample.ay, az: sample.az } }

    transaction do
      where(track:).delete_all
      insert_all!(rows) if rows.any?
    end
  end

  def self.last_time(track)
    return track.landed_at.to_f + SECONDS_AFTER_LANDING if track.landed_at

    track.deployed_at.to_f + SECONDS_AFTER_DEPLOY
  end
  private_class_method :last_time
end
