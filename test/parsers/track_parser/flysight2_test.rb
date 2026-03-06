require 'test_helper'

class TrackParser::Flysight2Test < ActiveSupport::TestCase
  test 'parses standard flysight2 file' do
    file = fixture_file_upload('tracks/fs2-track.csv')
    parser = TrackParser::Flysight2.new(file: file)

    points = parser.parse

    assert_predicate points.size, :positive?
    assert_kind_of Time, points.first.gps_time
  end

  test 'parses file with negative milliseconds in timestamps' do
    file = fixture_file_upload('tracks/fs2-negative-ms.csv')
    parser = TrackParser::Flysight2.new(file: file)

    points = parser.parse

    assert_equal 4, points.size
    assert_equal Time.utc(2026, 3, 6, 0, 49, 20, 0), points[2].gps_time
  end
end
