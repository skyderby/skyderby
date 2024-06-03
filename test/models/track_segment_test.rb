require 'test_helper'

class TrackSegmentTest < ActiveSupport::TestCase
  setup do
    @sample_points ||= [
      { gps_time: 11, latitude: 0.0, longitude: 0.0, altitude: 3050, v_speed: 100 },
      { gps_time: 14, latitude: 1.1, longitude: 1.9, altitude: 2950, v_speed: 120 },
      { gps_time: 17, latitude: 2.2, longitude: 2.8, altitude: 2850, v_speed: 130 },
      { gps_time: 21, latitude: 3.3, longitude: 3.7, altitude: 2750, v_speed: 140 },
      { gps_time: 24, latitude: 4.4, longitude: 4.6, altitude: 2650, v_speed: 150 },
      { gps_time: 27, latitude: 5.5, longitude: 5.5, altitude: 2550, v_speed: 160 },
      { gps_time: 31, latitude: 6.6, longitude: 6.4, altitude: 2450, v_speed: 170 },
      { gps_time: 34, latitude: 7.7, longitude: 7.3, altitude: 2350, v_speed: 180 }
    ]
  end

  test '#size' do
    assert_equal 8, TrackSegment.new(sample_points).size
  end

  test '#start_altitude' do
    assert_equal 3050, TrackSegment.new(sample_points).start_altitude
  end

  test '#end_altitude' do
    assert_equal 2350, TrackSegment.new(sample_points).end_altitude
  end

  test '#vertical_speed' do
    assert_in_delta 109.5, TrackSegment.new(sample_points).vertical_speed, 0.5
  end

  test '#time' do
    assert_equal 23, TrackSegment.new(sample_points).time
  end
end
