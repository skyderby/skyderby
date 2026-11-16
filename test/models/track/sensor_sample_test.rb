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

  test 'stores samples as arrays alongside rows' do
    track = create_track_from_file('speed_skydiving_411.csv', kind: :speed_skydiving, suit: nil)
    attach_sensor_data(track) { [0.0, 0.0, 1.0] }

    series = track.reload.sensor_series
    rows = track.sensor_samples.order(:gps_time_in_seconds).pluck(:gps_time_in_seconds, :az)

    assert_equal rows.map { |time, _| time.to_f }, series.samples.map(&:gps_time)
    assert_equal rows.map(&:last), series.az
  end

  test 'copies legacy samples into arrays with verification' do
    track = create_track_from_file('speed_skydiving_411.csv', kind: :speed_skydiving, suit: nil)
    attach_sensor_data(track) { [0.0, 0.0, 1.0] }
    expected = track.reload.sensor_series.az
    Track::SensorSeries.where(track:).delete_all

    Track::SensorSeries.copy_from_legacy!([track.id])

    assert_equal expected, Track::SensorSeries.find(track.id).az
    assert_empty Track::SensorSeries.mismatched_legacy_ids([track.id])
  end
end
