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
    assert_in_delta legacy.h_speed, point.h_speed, 1e-9
  end

  test 'copies legacy points into arrays' do
    track = create_track_from_file('flysight.csv')
    recorded = Track::Points.find(track.id)
    Track::Points.where(track:).delete_all

    Track::Points.copy_from_legacy!([track.id])
    copied = Track::Points.find(track.id)

    assert_equal recorded.gps_time.map(&:to_f), copied.gps_time.map(&:to_f)
    assert_equal recorded.latitude, copied.latitude
    assert_equal recorded.abs_altitude, copied.abs_altitude
    assert_nil copied.elevation
    recorded.h_speed.zip(copied.h_speed).each { |expected, actual| assert_in_delta expected, actual, 1e-9 }
  end

  test 'drops duplicated timestamps when copying legacy points' do
    track = create_track_from_file('flysight.csv')
    Track::Points.where(track:).delete_all
    first = track.points.first
    Point.create!(first.attributes.except('id').merge('h_speed' => 999))

    Track::Points.copy_from_legacy!([track.id])

    assert_equal track.points.count - 1, Track::Points.find(track.id).size
    assert_in_delta first.h_speed / 3.6, Track::Points.find(track.id).h_speed.first, 1e-9
  end

  test 'restores missing accuracy from the source file' do
    track = create_track_from_file('flysight.csv')
    points = Track::Points.find(track.id)
    expected = points.horizontal_accuracy
    points.update!(horizontal_accuracy: nil, vertical_accuracy: nil, speed_accuracy: nil)

    assert points.reload.restore_accuracy_from_file
    assert_equal expected, points.reload.horizontal_accuracy
    assert_not points.restore_accuracy_from_file
  end

  test 'reports tracks whose copy differs from legacy points' do
    track = create_track_from_file('flysight.csv')

    assert_empty Track::Points.mismatched_legacy_ids([track.id])

    track.points.first.update!(h_speed: 500)

    assert_equal [track.id], Track::Points.mismatched_legacy_ids([track.id])
  end

  test 'reports tracks whose arrays differ in any fingerprinted column' do
    track = create_track_from_file('flysight.csv')

    track.points.second.update!(v_speed: 1)

    assert_equal [track.id], Track::Points.mismatched_legacy_ids([track.id])
  end

  test 'ignores accuracy restored on top of legacy points without it' do
    track = create_track_from_file('flysight.csv')
    Point.where(track:).update_all(vertical_accuracy: nil)

    assert_empty Track::Points.mismatched_legacy_ids([track.id])
  end

  test 'rolls back a copy that fails verification' do
    track = create_track_from_file('flysight.csv')
    Track::Points.where(track:).delete_all

    Track::Points.stub(:mismatched_legacy_ids, [track.id]) do
      assert_raises(Track::Points::CopyMismatch) { Track::Points.copy_from_legacy!([track.id]) }
    end

    assert_not Track::Points.exists?(track.id)
  end

  test 'returns fresh points after restoring accuracy' do
    track = create_track_from_file('flysight.csv')
    points = Track::Points.find(track.id)
    points.update!(horizontal_accuracy: nil, vertical_accuracy: nil, speed_accuracy: nil)

    assert_nil points.points.first.horizontal_accuracy
    points.restore_accuracy_from_file

    assert_not_nil points.points.first.horizontal_accuracy
  end
end
