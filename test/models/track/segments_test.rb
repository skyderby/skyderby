require 'test_helper'

class Track::SegmentsTest < ActiveSupport::TestCase
  test 'wind affected skydive' do
    assert_segments '#7990 15-56-18.CSV', exit_at: 699, deploy: '2016-10-23T21:10:03Z'
  end

  test 'skydive with a swoop' do
    assert_segments '#703 14-41-39.CSV', exit_at: 514, deploy: '2014-08-07T14:52:03Z'
  end

  test 'skydive after a high aircraft descent' do
    assert_segments '#RWL 13-41-49.CSV', exit_at: 1241, deploy: '2017-06-17T10:04:43Z'
  end

  test 'wingsuit basejump' do
    assert_segments 'Base Big WS labeled.csv', exit_at: 181, deploy: '2018-01-10T09:09:57.4Z'
  end

  test 'exit is pulled back to the point of no return on a base jump' do
    segments = Track::Segments.new(points_from('base_2330_point_of_no_return.csv'))

    assert_in_delta 715, segments.exit_point.fl_time, 3
    assert_in_delta 752, segments.deploy_point.fl_time, 4
  end

  test 'exit follows the apex when the aircraft is still climbing' do
    segments = Track::Segments.new(points_from('skydive_2256_climbing_aircraft.csv'))

    assert_in_delta 573, segments.exit_point.fl_time, 4
    assert_in_delta 716, segments.deploy_point.fl_time, 4
  end

  test 'exit clears the aircraft baseline on a descending jump run' do
    segments = Track::Segments.new(points_from('skydive_2573_descending_jump_run.csv'))

    assert_in_delta 431, segments.exit_point.fl_time, 3
    assert_in_delta 576, segments.deploy_point.fl_time, 4
  end

  test 'exit is found even when the recording ends before landing' do
    segments = Track::Segments.new(points_from('skydive_2522_descending_jump_run.csv'))

    assert_in_delta 54, segments.exit_point.fl_time, 3
    assert_in_delta 155, segments.deploy_point.fl_time, 4
    assert_nil segments.landing_point
  end

  test 'a wingsuit that never reaches terminal is still detected' do
    segments = Track::Segments.new(points_from('wingsuit_base_2843_low_terminal.csv'))

    assert_in_delta 216, segments.exit_point.fl_time, 3
    assert_in_delta 264, segments.deploy_point.fl_time, 4
  end

  test 'a brief early descent does not win over the main jump' do
    segments = Track::Segments.new(points_from('skydive_2983_high_then_main.csv'))

    assert_in_delta 101, segments.exit_point.fl_time, 3
    assert_in_delta 207, segments.deploy_point.fl_time, 4
  end

  test 'a steep aircraft descent at the start is not mistaken for the jump' do
    segments = Track::Segments.new(points_from('skydive_4560_aircraft_descent_start.csv'))

    assert_in_delta 254, segments.exit_point.fl_time, 3
    assert_in_delta 340, segments.deploy_point.fl_time, 4
  end

  test 'a fast canopy is not mistaken for continued flight' do
    segments = Track::Segments.new(points_from('wingsuit_3172_fast_canopy.csv'))

    assert_in_delta 1433, segments.exit_point.fl_time, 3
    assert_in_delta 1700, segments.deploy_point.fl_time, 6
    assert_in_delta 1846, segments.landing_point.fl_time, 5
  end

  test 'a canopy swoop after deploy does not push the deploy later' do
    segments = Track::Segments.new(points_from('skydive_3229_canopy_swoop.csv'))

    assert_in_delta 454, segments.exit_point.fl_time, 3
    assert_in_delta 506, segments.deploy_point.fl_time, 3
  end

  test 'deploy is found on a base jump with a slow freefall' do
    segments = Track::Segments.new(points_from('base_3403_slow_freefall.csv'))

    assert_in_delta 91, segments.exit_point.fl_time, 3
    assert_in_delta 156, segments.deploy_point.fl_time, 3
  end

  test 'deploy is found on a short low base jump' do
    segments = Track::Segments.new(points_from('base_3552_short_jump.csv'))

    assert_in_delta 77, segments.exit_point.fl_time, 3
    assert_in_delta 89, segments.deploy_point.fl_time, 3
  end

  test 'deploy follows the airspeed collapse when freefall runs slow' do
    segments = Track::Segments.new(points_from('base_3407_slow_freefall_plateau.csv'))

    assert_in_delta 109, segments.exit_point.fl_time, 3
    assert_in_delta 183, segments.deploy_point.fl_time, 3
  end

  test 'a wingsuit with a low peak descent is still recognised as a jump' do
    segments = Track::Segments.new(points_from('wingsuit_base_3977_low_peak.csv'))

    assert_not segments.require_review?
    assert_in_delta 153, segments.exit_point.fl_time, 3
    assert_in_delta 223, segments.deploy_point.fl_time, 3
  end

  test 'a short jump inside a long recording is still found' do
    segments = Track::Segments.new(points_from('wingsuit_4743_long_recording.csv'))

    assert_not segments.require_review?
    assert_in_delta 1001, segments.exit_point.fl_time, 3
    assert_in_delta 1044, segments.deploy_point.fl_time, 8
  end

  test 'a recording gap during the climb does not fake an early exit' do
    segments = Track::Segments.new(points_from('skydive_2154_recording_gap.csv'))

    assert_in_delta 744, segments.exit_point.fl_time, 3
    assert_in_delta 838, segments.deploy_point.fl_time, 5
    assert_in_delta 998, segments.landing_point.fl_time, 5
  end

  test 'landing is the first lasting stop on the ground' do
    points = points_from('#7990 15-56-18.CSV')
    segments = Track::Segments.new(points)

    landing = segments.landing_point
    assert_not_nil landing
    assert_operator landing.gps_time, :>, segments.deploy_point.gps_time
    assert_in_delta points.last.abs_altitude, landing.abs_altitude, 30
  end

  test 'landing is captured even when the recording ends shortly after touchdown' do
    segments = Track::Segments.new(points_from('#703 14-41-39.CSV'))

    assert_not_nil segments.landing_point
  end

  test 'a canopy flown into a headwind is not mistaken for landing' do
    segments = Track::Segments.new(points_from('skydive_4976_headwind_canopy.csv'))

    assert_in_delta 517, segments.landing_point.fl_time, 5
  end

  test 'a track without a jump is flagged for review and falls back to its bounds' do
    points = points_from('flysight_warmup.csv')
    segments = Track::Segments.new(points)

    assert_predicate segments, :require_review?
    assert_equal points.first, segments.exit_point
    assert_equal points.last, segments.deploy_point
    assert_nil segments.landing_point
  end

  private

  def assert_segments(filename, exit_at:, deploy:)
    segments = Track::Segments.new(points_from(filename))

    assert_not segments.require_review?, "expected a jump to be found in #{filename}"
    assert_in_delta exit_at, segments.exit_point.fl_time, 3, "exit off in #{filename}"
    assert_in_delta Time.zone.parse(deploy), segments.deploy_point.gps_time, 3,
                    "deploy off in #{filename}"
  end

  def points_from(filename)
    path = file_fixture("tracks/scanner/#{filename}")
    first_time = nil

    CSV.read(path, headers: true).filter_map do |row|
      next unless row['time'].to_s.match?(/\A\d{4}-\d{2}-\d{2}/)

      gps_time = Time.zone.parse(row['time'])
      first_time ||= gps_time

      TrackParser::PointRecord.new.tap do |point|
        point.gps_time = gps_time
        point.fl_time = gps_time - first_time
        point.abs_altitude = row['hMSL'].to_f
        point.h_speed = horizontal_speed(row)
        point.v_speed = vertical_speed(row)
      end
    end
  end

  def horizontal_speed(row)
    return row['h_speed'].to_f if row['h_speed']

    Math.hypot(row['velN'].to_f, row['velE'].to_f) * 3.6
  end

  def vertical_speed(row)
    return row['v_speed'].to_f if row['v_speed']

    row['velD'].to_f * 3.6
  end
end
