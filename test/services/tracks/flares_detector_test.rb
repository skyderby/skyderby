require 'test_helper'

class Tracks::FlaresDetectorTest < ActiveSupport::TestCase
  test 'finds flare in skydive track' do
    track = create_track_from_file '13-31-51_Ravenna.CSV'
    track.update!(ff_start: 10, ff_end: 144) unless track.ff_start == 10
    points = PointsQuery.execute track, trimmed: true, only: %i[gps_time altitude v_speed]

    flares = Tracks::FlaresDetector.call(points)

    assert_equal 3, flares.count
    assert_in_delta 7, flares.first.altitude_gain, 1
    assert_in_delta 4, flares.first.gain_duration, 0.5
  end

  test 'handles empty points' do
    flares = Tracks::FlaresDetector.call([])

    assert_empty flares
  end
end
