require 'test_helper'

class Tracks::FlaresDetectorTest < ActiveSupport::TestCase
  test 'finds flare in skydive track' do
    track = create_track_from_file '13-31-51_Ravenna.CSV'
    track.update!(ff_start: 10, ff_end: 144)
    points = PointsQuery.execute track, trimmed: true, only: %i[gps_time altitude v_speed]

    flares = Tracks::FlaresDetector.call(points)

    assert_equal 3, flares.count
    assert_in_delta 7, flares.first.altitude_gain, 1
    assert_in_delta 4, flares.first.gain_duration, 0.5
  end

  test 'keeps a flare the entry speed can explain' do
    flares = Tracks::FlaresDetector.call(climb(entry_speed: 100, gain: 10))

    assert_in_delta 10, flares.sole.altitude_gain, 0.1
  end

  test 'drops a climb without speed before it' do
    assert_empty Tracks::FlaresDetector.call(climb(entry_speed: 30, gain: 3))
  end

  test 'drops a climb higher than the entry speed allows' do
    assert_empty Tracks::FlaresDetector.call(climb(entry_speed: 100, gain: 30))
  end

  test 'skips the check when horizontal speed is not loaded' do
    points = climb(entry_speed: 30, gain: 3).map { |point| point.except(:h_speed) }

    assert_equal 1, Tracks::FlaresDetector.call(points).size
  end

  test 'handles empty points' do
    flares = Tracks::FlaresDetector.call([])

    assert_empty flares
  end

  private

  def climb(entry_speed:, gain:)
    start = Time.zone.parse('2025-06-01 10:00:00')
    lead = (0..8).map do |second|
      { gps_time: start + second, altitude: 1000.0 - (second * 10), h_speed: entry_speed.to_f, v_speed: 5.0 }
    end
    rise = (1..5).map do |second|
      { gps_time: start + 8 + second, altitude: 920.0 + (gain * second / 5.0), h_speed: entry_speed / 2.0,
        v_speed: -5.0 }
    end
    lead + rise
  end
end
