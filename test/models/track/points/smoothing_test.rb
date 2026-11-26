require 'test_helper'

class Track::Points::SmoothingTest < ActiveSupport::TestCase
  setup do
    start_time = 1.day.ago.beginning_of_hour

    # rubocop:disable Layout/LineLength
    @points = [
      { gps_time: start_time,       fl_time: 0.0, altitude: 3500, latitude: 24.8903, longitude: 55.54479, h_speed: 20, v_speed: 20, distance: 20 },
      { gps_time: start_time + 0.5, fl_time: 0.5, altitude: 3400, latitude: 24.8904, longitude: 55.54477, h_speed: 30, v_speed: 30, distance: 20 },
      { gps_time: start_time + 1.0, fl_time: 1.0, altitude: 3300, latitude: 24.8905, longitude: 55.54475, h_speed: 40, v_speed: 40, distance: 20 },
      { gps_time: start_time + 1.5, fl_time: 1.5, altitude: 3200, latitude: 24.8906, longitude: 55.54473, h_speed: 50, v_speed: 50, distance: 20 },
      { gps_time: start_time + 2.0, fl_time: 2.0, altitude: 3100, latitude: 24.8907, longitude: 55.54471, h_speed: 50, v_speed: 60, distance: 20 },
      { gps_time: start_time + 2.5, fl_time: 2.5, altitude: 3000, latitude: 24.8908, longitude: 55.54469, h_speed: 50, v_speed: 70, distance: 20 }
    ].map { |attributes| build_point(**attributes) }
    # rubocop:enable Layout/LineLength
  end

  test 'calculates horizontal speed from positions' do
    assert_equal(Array.new(6, 22.6), smoothed.map { |point| point.h_speed.round(1) })
  end

  test 'calculates vertical speed from altitudes' do
    assert_equal(Array.new(6, 200), smoothed.map { |point| point.v_speed.round(1) })
  end

  test 'keeps vertical speed negative while climbing' do
    climbing = @points.reverse.each_with_index.map do |point, index|
      point.with(gps_time: @points[index].gps_time, fl_time: @points[index].fl_time)
    end

    assert_equal(Array.new(6, -200), Track::Points.smooth(climbing).map { |point| point.v_speed.round(1) })
  end

  test 'recalculates glide ratio and full speed' do
    assert_equal(Array.new(6, 0.11), smoothed.map { |point| point.glide_ratio.round(2) })
    assert_equal(Array.new(6, 201.3), smoothed.map { |point| point.full_speed.round(1) })
  end

  test 'keeps empty points' do
    assert_empty Track::Points.smooth([])
  end

  private

  def smoothed = Track::Points.smooth(@points)
end
