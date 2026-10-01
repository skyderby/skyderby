require 'test_helper'

class Track::FileTest < ActiveSupport::TestCase
  test 'is invalid without a file' do
    track_file = Track::File.new

    assert_not track_file.valid?
    assert_includes track_file.errors[:file], "can't be blank"
  end

  test 'is valid with an attached file' do
    track_file = Track::File.new(file: File.open(file_fixture('tracks/flysight.csv')))

    assert_predicate track_file, :valid?
  end

  test 'assigns track and sensor files from a single file list' do
    uploads = ['', File.open(file_fixture('tracks/fs2-sensor.csv')), File.open(file_fixture('tracks/fs2-track.csv'))]
    track_file = Track::File.new(files: uploads)

    assert_predicate track_file, :valid?
    assert_equal 'fs2-track.csv', track_file.file.filename.to_s
    assert_equal 'fs2-sensor.csv.gz', track_file.sensor_file.filename.to_s
  end

  test 'is invalid with only a sensor file' do
    track_file = Track::File.new(files: [File.open(file_fixture('tracks/fs2-sensor.csv'))])

    assert_not track_file.valid?
    assert_includes track_file.errors[:file], "can't be blank"
  end

  test 'is invalid with several track files' do
    track_file = Track::File.new(files: [fixture('fs2-track.csv'), fixture('flysight.csv')])

    assert_not track_file.valid?
    assert_not_empty track_file.errors.where(:file, :multiple_tracks)
  end

  test 'is invalid with several sensor files' do
    uploads = [fixture('fs2-track.csv'), fixture('fs2-sensor.csv'), fixture('fs2-sensor.csv')]
    track_file = Track::File.new(files: uploads)

    assert_not track_file.valid?
    assert_not_empty track_file.errors.where(:sensor_file, :multiple_sensors)
  end

  test 'is invalid with sensor file for non FlySight 2 track' do
    track_file = Track::File.new(files: [fixture('flysight.csv'), fixture('fs2-sensor.csv')])

    assert_not track_file.valid?
    assert_not_empty track_file.errors.where(:sensor_file, :requires_flysight2)
  end

  test 'is invalid with sensor file from another recording' do
    content = file_fixture('tracks/fs2-sensor.csv').read.sub('6381f8666b441b94a67fb637', 'a' * 24)
    sensor = StringIO.new(content)
    upload = Rack::Test::UploadedFile.new(sensor, 'text/csv', original_filename: 'SENSOR.CSV')
    track_file = Track::File.new(files: [fixture('fs2-track.csv'), upload])

    assert_not track_file.valid?
    assert_not_empty track_file.errors.where(:sensor_file, :session_mismatch)
  end

  test 'is invalid with too large sensor file' do
    sensor = fixture('fs2-sensor.csv')
    sensor.define_singleton_method(:size) { Track::File::MAX_SENSOR_FILE_SIZE + 1 }
    track_file = Track::File.new(files: [fixture('fs2-track.csv'), sensor])

    assert_not track_file.valid?
    assert_not_empty track_file.errors.where(:sensor_file, :file_too_large)
    assert_not_predicate track_file.sensor_file, :attached?
  end

  private

  def fixture(name) = File.open(file_fixture("tracks/#{name}"))
end
