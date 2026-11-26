require 'test_helper'

class Track::PointsTest < ActiveSupport::TestCase
  test 'records parsed points with speeds in meters per second' do
    track = create_track_from_file('flysight.csv')
    legacy = track.points.pluck(:gps_time_in_seconds, :latitude, :h_speed, :v_speed, :vertical_accuracy)
    stored = Track::Points.find(track.id)

    assert_equal legacy.size, stored.size
    assert_equal legacy.map { |row| row[0].to_f }, stored.gps_time.map(&:to_f)
    assert_equal legacy.pluck(1), stored.latitude
    assert_in_delta legacy.sum { |row| row[2] } / 3.6, stored.h_speed.sum, 1e-6
    assert_in_delta legacy.sum { |row| row[3] } / 3.6, stored.v_speed.sum, 1e-6
    assert_equal(legacy.map { |row| row[4].round(3) }, stored.vertical_accuracy.map { |value| value.round(3) })
  end

  test 'exposes points as value objects' do
    track = create_track_from_file('flysight.csv')
    point = Track::Points.find(track.id).points[100]
    legacy = track.points.offset(100).first

    assert_equal legacy.gps_time.to_f, point.gps_time.to_f
    assert_equal legacy.longitude, point.longitude
    assert_in_delta legacy.h_speed / 3.6, point.h_speed, 1e-9
  end
end
