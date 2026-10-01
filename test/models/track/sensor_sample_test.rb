require 'test_helper'

class Track::SensorSampleTest < ActiveSupport::TestCase
  test 'imports samples around the jump from the gzipped sensor file' do
    track = create_track_from_file('speed_skydiving_411.csv', kind: :speed_skydiving, suit: nil)
    attach_sensor_data(track) { [0.0, 0.0, 1.0] }

    times = track.sensor_samples.pluck(:gps_time_in_seconds).map(&:to_f)

    assert_predicate times, :any?
    assert_operator times.min, :>=, track.exited_at.to_f - Track::SensorSample::SECONDS_BEFORE_EXIT
    assert_operator times.max, :<=, track.deployed_at.to_f + 90
  end

  test 'reimport replaces existing samples' do
    track = create_track_from_file('speed_skydiving_411.csv', kind: :speed_skydiving, suit: nil)
    attach_sensor_data(track) { [0.0, 0.0, 1.0] }

    assert_no_difference -> { track.sensor_samples.count } do
      Track::SensorSample.import(track)
    end
  end
end
