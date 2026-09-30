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
    assert_equal 'fs2-sensor.csv', track_file.sensor_file.filename.to_s
  end

  test 'is invalid with only a sensor file' do
    track_file = Track::File.new(files: [File.open(file_fixture('tracks/fs2-sensor.csv'))])

    assert_not track_file.valid?
    assert_includes track_file.errors[:file], "can't be blank"
  end
end
