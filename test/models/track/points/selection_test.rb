require 'test_helper'

class Track::PointSelectionTest < ActiveSupport::TestCase
  setup do
    @track = Track.create!(ff_start: 1, ff_end: 2.5, pilot: profiles(:john)).tap do |track|
      start_time = @start_time = 1.day.ago.beginning_of_hour.to_i
      # rubocop:disable Layout/LineLength
      record_points(
        track,
        [
          { gps_time: start_time,       abs_altitude: 3500, latitude: 24.8903, longitude: 55.54479, h_speed: 20, v_speed: 20, distance: 20 },
          { gps_time: start_time + 0.5, abs_altitude: 3400, latitude: 24.8904, longitude: 55.54477, h_speed: 30, v_speed: 30, distance: 20 },
          { gps_time: start_time + 1.0, abs_altitude: 3300, latitude: 24.8905, longitude: 55.54475, h_speed: 40, v_speed: 40, distance: 20 },
          { gps_time: start_time + 1.5, abs_altitude: 3200, latitude: 24.8906, longitude: 55.54473, h_speed: 50, v_speed: 50, distance: 20 },
          { gps_time: start_time + 2.0, abs_altitude: 3100, latitude: 24.8907, longitude: 55.54471, h_speed: 50, v_speed: 60, distance: 20 },
          { gps_time: start_time + 2.5, abs_altitude: 3000, latitude: 24.8908, longitude: 55.54469, h_speed: 50, v_speed: 70, distance: 20 }
        ]
      )
      # rubocop:enable Layout/LineLength
    end
  end

  test 'at_1hz keeps one point per second' do
    result = @track.recorded_points.at_1hz.map { |point| point.to_h.slice(:fl_time, :abs_altitude) }
    assert_equal [
      { fl_time: 0.0, abs_altitude: 3500 },
      { fl_time: 1.0, abs_altitude: 3300 },
      { fl_time: 2.0, abs_altitude: 3100 }
    ], result
  end

  test 'freefall_points keeps points between exit and deploy' do
    result = @track.freefall_points.map { |point| point.to_h.slice(:fl_time, :abs_altitude) }
    assert_equal [
      { fl_time: 1.0, abs_altitude: 3300 },
      { fl_time: 1.5, abs_altitude: 3200 },
      { fl_time: 2.0, abs_altitude: 3100 }
    ], result
  end

  test 'extended widens the freefall window' do
    result = @track.freefall_points.extended(before: 0.5)
                   .map { |point| point.to_h.slice(:fl_time, :abs_altitude) }

    assert_equal [
      { fl_time: 0.5, abs_altitude: 3400 },
      { fl_time: 1.0, abs_altitude: 3300 },
      { fl_time: 1.5, abs_altitude: 3200 },
      { fl_time: 2.0, abs_altitude: 3100 }
    ], result
  end

  test 'returns speeds in m/s and time between returned points' do
    @track.update_columns(gps_type: Track.gps_types[:flysight])
    result = @track.recorded_points.at_1hz

    assert_equal([20.0, 40.0, 50.0], result.map { |point| (point.h_speed * 3.6).round(6) })
    assert_equal [0, 1.0, 1.0], result.map(&:time_diff)
  end

  test 'trims by the exit and deploy timestamps' do
    @track.update_columns(exited_at: Time.zone.at(@start_time), deployed_at: Time.zone.at(@start_time + 1.5))

    result = @track.freefall_points

    assert_equal [0.0, 0.5, 1.0, 1.5], result.map(&:fl_time)
  end

  test 'smooths speeds over the whole track before trimming' do
    full = @track.recorded_points
    trimmed = @track.freefall_points

    assert_equal full.select { |point| point.fl_time.between?(1.0, 2.0) }.map(&:h_speed), trimmed.map(&:h_speed)
    assert_not_equal @track.point_arrays.h_speed[2], trimmed.first.h_speed
  end

  test 'keeps samples that sit exactly on sub-second exit and deploy timestamps' do
    times = [1_699_999_999_002, 1_699_999_999_502, 1_700_000_000_002, 1_700_000_000_502, 1_700_000_001_011,
             1_700_000_001_511].map { |ms| Time.zone.at(Rational(ms, 1000)) }
    @track.point_arrays.update!(gps_time: times)
    @track.update_columns(exited_at: times[2], deployed_at: times[4])
    @track.reset_point_arrays

    result = @track.freefall_points

    assert_equal(times[2..4].map(&:to_r), result.map { |point| point.gps_time.to_r })
    assert_equal @track.exit_point.gps_time, result.first.gps_time
  end

  test 'returns no points for a track without a recording' do
    track = Track.create!(pilot: profiles(:john))

    assert_empty track.freefall_points.extended(before: 10).at_1hz
  end
end
