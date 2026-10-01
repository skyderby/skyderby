require 'test_helper'

class SensorParser::Flysight2Test < ActiveSupport::TestCase
  test 'parses IMU samples with GPS aligned time' do
    samples = SensorParser::Flysight2.new(file_fixture('tracks/fs2-sensor.csv').open).samples

    assert_equal 2, samples.size
    assert_equal Time.utc(2026, 1, 8, 12, 0, 0).to_f, samples.first.gps_time
    assert_equal Time.utc(2026, 1, 8, 12, 0, 0.5).to_f, samples.last.gps_time
    assert_equal [0.01, -0.98, 0.03], samples.last.vector
  end

  test 'returns no samples without time synchronization records' do
    io = StringIO.new("$COL,IMU,time,wx,wy,wz,ax,ay,az,temperature\n$IMU,1.0,0,0,0,0,0,1,20\n")

    assert_empty SensorParser::Flysight2.new(io).samples
  end

  test 'detects sensor files' do
    assert SensorParser::Flysight2.sensor_file?(file_fixture('tracks/fs2-sensor.csv').open)
    assert_not SensorParser::Flysight2.sensor_file?(file_fixture('tracks/fs2-track.csv').open)
  end
end
