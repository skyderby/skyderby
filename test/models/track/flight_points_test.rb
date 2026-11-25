require 'test_helper'

class Track::FlightPointsTest < ActiveSupport::TestCase
  setup do
    @track = Track.create!(ff_start: 1, ff_end: 2.5, pilot: profiles(:john)).tap do |track|
      start_time = @start_time = 1.day.ago.beginning_of_hour.to_i
      # rubocop:disable Layout/LineLength
      track.points.insert_all!(
        [
          { gps_time_in_seconds: start_time,       fl_time: 0.0, abs_altitude: 3500, latitude: 24.8903, longitude: 55.54479, h_speed: 20, v_speed: 20, distance: 20 },
          { gps_time_in_seconds: start_time + 0.5, fl_time: 0.5, abs_altitude: 3400, latitude: 24.8904, longitude: 55.54477, h_speed: 30, v_speed: 30, distance: 20 },
          { gps_time_in_seconds: start_time + 1.0, fl_time: 1.0, abs_altitude: 3300, latitude: 24.8905, longitude: 55.54475, h_speed: 40, v_speed: 40, distance: 20 },
          { gps_time_in_seconds: start_time + 1.5, fl_time: 1.5, abs_altitude: 3200, latitude: 24.8906, longitude: 55.54473, h_speed: 50, v_speed: 50, distance: 20 },
          { gps_time_in_seconds: start_time + 2.0, fl_time: 2.0, abs_altitude: 3100, latitude: 24.8907, longitude: 55.54471, h_speed: 50, v_speed: 60, distance: 20 },
          { gps_time_in_seconds: start_time + 2.5, fl_time: 2.5, abs_altitude: 3000, latitude: 24.8908, longitude: 55.54469, h_speed: 50, v_speed: 70, distance: 20 }
        ]
      )
      # rubocop:enable Layout/LineLength
      sync_point_arrays(track)
    end
  end

  test 'filter points by frequency if freq_1hz specified' do
    result = @track.flight_points(freq_1hz: true).map { |point| point.to_h.slice(:fl_time, :abs_altitude) }
    assert_equal [
      { fl_time: 0.0, abs_altitude: 3500 },
      { fl_time: 1.0, abs_altitude: 3300 },
      { fl_time: 2.0, abs_altitude: 3100 }
    ], result
  end

  test 'trim points if trimmed option specified' do
    result = @track.flight_points(trimmed: true).map { |point| point.to_h.slice(:fl_time, :abs_altitude) }
    assert_equal [
      { fl_time: 1.0, abs_altitude: 3300 },
      { fl_time: 1.5, abs_altitude: 3200 },
      { fl_time: 2.0, abs_altitude: 3100 }
    ], result
  end

  test 'trim points with additional trimmed option specified' do
    result = @track.flight_points(trimmed: { seconds_before_start: 0.5 })
                   .map { |point| point.to_h.slice(:fl_time, :abs_altitude) }

    assert_equal [
      { fl_time: 0.5, abs_altitude: 3400 },
      { fl_time: 1.0, abs_altitude: 3300 },
      { fl_time: 1.5, abs_altitude: 3200 },
      { fl_time: 2.0, abs_altitude: 3100 }
    ], result
  end

  test 'returns speeds in km/h and time between returned points' do
    result = @track.flight_points(freq_1hz: true)

    assert_equal([20.0, 40.0, 50.0], result.map { |point| point.h_speed.round(6) })
    assert_equal [0, 1.0, 1.0], result.map(&:time_diff)
  end

  test 'trims by the exit and deploy timestamps' do
    @track.update_columns(exited_at: Time.zone.at(@start_time), deployed_at: Time.zone.at(@start_time + 1.5))

    result = @track.flight_points(trimmed: true)

    assert_equal [0.0, 0.5, 1.0, 1.5], result.map(&:fl_time)
  end
end
