require 'test_helper'

class SegmentParser::GpxTest < ActiveSupport::TestCase
  include ActionDispatch::TestProcess

  setup do
    @file = fixture_file_upload('tracks/two_tracks.gpx')
  end

  test 'returns segments' do
    parser = SegmentParser::Gpx.new(@file)

    assert_equal 3, parser.segments.count
  end

  test 'parses segment name, point count, gain altitude, loose altitude' do
    parser = SegmentParser::Gpx.new(@file)

    segment = parser.segments.first
    assert_equal 'ACTIVE LOG: 20 SEP 2014 15:10', segment.name
    assert_equal 388, segment.points_count
    assert_equal 561, segment.h_up
    assert_equal 3970, segment.h_down
  end
end
