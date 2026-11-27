require 'test_helper'

class Track::PointsTest < ActiveSupport::TestCase
  test 'records parsed points with speeds in meters per second' do
    track = create_track_from_file('flysight.csv')
    parsed = parsed_points(track)
    stored = Track::Points.find(track.id)

    assert_equal parsed.size, stored.size
    assert_equal parsed.map { |point| point.gps_time.to_f.round(3) }, stored.gps_time.map(&:to_f)
    assert_equal(parsed.map { |point| BigDecimal(point.latitude.to_s) }, stored.latitude)
    assert_in_delta parsed.sum(&:h_speed) / 3.6, stored.h_speed.sum, 1e-6
    assert_in_delta parsed.sum(&:v_speed) / 3.6, stored.v_speed.sum, 1e-6
    expected_accuracy = parsed.map { |point| Float(point.vertical_accuracy).round(3) }
    assert_equal(expected_accuracy, stored.vertical_accuracy.map { |value| value.round(3) })
  end

  test 'exposes points as value objects' do
    track = create_track_from_file('flysight.csv')
    point = Track::Points.find(track.id).points[100]
    parsed = parsed_points(track)[100]

    assert_in_delta parsed.gps_time.to_f, point.gps_time.to_f, 1e-3
    assert_equal BigDecimal(parsed.longitude.to_s), point.longitude
    assert_in_delta parsed.h_speed / 3.6, point.h_speed, 1e-9
  end

  private

  def parsed_points(track)
    track_file = track.track_file
    points = TrackParser.for(track_file.file_format).new(file: track_file.source, segment: 0).parse
    PointsProcessor.for(track_file.file_format).new(points).execute.sort_by { |point| point.gps_time.to_f }
  end
end
