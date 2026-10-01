module SensorDataHelper
  def attach_sensor_data(track, canopy: [0.0, 0.0, 1.0])
    start = track.exited_at.to_f - 30
    rows = sensor_header(start)
    (0..(track.deployed_at.to_f + 90 - start)).step(0.2).each do |time|
      at = Time.zone.at(start + time)
      vector = at < track.deployed_at ? yield(at) : canopy
      rows << "$IMU,#{format('%.3f', time)},0,0,0,#{vector.join(',')},20.0"
    end

    attach_sensor_file(track.track_file, rows.join("\n"))
  end

  def attach_sensor_file(track_file, content)
    blob = ActiveStorage::Blob.create_and_upload!(io: StringIO.new(Zlib.gzip(content)), filename: 'SENSOR.CSV.gz')
    ActiveStorage::Attachment.create!(name: 'sensor_file', record: track_file, blob:)
    track_file.reload
    Track::SensorSample.import(track_file.track)
  end

  def sensor_header(start)
    week, tow = (start - SensorParser::Flysight2::GPS_EPOCH).divmod(SensorParser::Flysight2::SECONDS_IN_WEEK)

    [
      '$COL,IMU,time,wx,wy,wz,ax,ay,az,temperature',
      '$COL,TIME,time,tow,week',
      '$DATA',
      "$TIME,0.000,#{format('%.3f', tow)},#{week}"
    ]
  end
end
