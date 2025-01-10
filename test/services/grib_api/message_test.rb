require 'test_helper'

class GribApi::MessageTest < ActiveSupport::TestCase
  setup do
    file = GribApi.open(file_fixture('2024_03_16_gfs.t00z.pgrb2.0p25.anl'))

    @message = file.messages.find do |message|
      message.level == GribApi::Level.new(900, 'isobaricInhPa') &&
        message.variable == 'geopotential_height'
    end
  end

  test '#nearest_point' do
    nearest_point = @message.nearest_point(28.21975954, -82.15107322)

    assert_in_delta 28.25, nearest_point.lat, 0.001
    assert_in_delta 277.75, nearest_point.lon, 0.001
    assert_in_delta 1053.007875, nearest_point.value, 0.00001
    assert_in_delta 10.25846057, nearest_point.distance.truncate(8), 0.00001
  end

  test '#surrounding_points' do
    result = @message.surrounding_points(28.21975954, -82.15107322)

    assert_equal [28.25, 28.25, 28.0, 28.0], result.lats
    assert_equal [278.0, 277.75, 278.0, 277.75], result.lons
    assert_equal [1053.871875, 1053.007875, 1054.463875, 1053.855875], result.values
    assert_equal [15.17754275, 10.25846057, 28.57849134, 26.29288722], result.distances.map { _1.truncate(8) }
  end

  test '#surrounding_points_outside_of_area' do
    assert_raises(GribApi::OutOfArea) { @message.surrounding_points(0, 0) }
  end
end
