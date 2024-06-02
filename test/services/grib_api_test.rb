require 'test_helper'

class GribApiTest < ActiveSupport::TestCase
  setup do
    @file = GribApi.open(file_fixture('2024_03_16_gfs.t00z.pgrb2.0p25.anl'))
    @message = @file.messages.find do |message|
      message.level == GribApi::Level.new(900, 'isobaricInhPa') &&
        message.variable == 'geopotential_height'
    end
  end

  test '#time' do
    assert_equal Time.new(2024, 3, 16, 0, 0, 0, '+00:00'), GribApi.open(file_fixture('2024_03_16_gfs.t00z.pgrb2.0p25.anl')).timestamp
    assert_equal Time.new(2024, 3, 8, 18, 0, 0, '+00:00'), GribApi.open(file_fixture('gfs.t18z.pgrb2.0p25.anl')).timestamp
  end

  test '#message_count' do
    assert_equal 45, @file.message_count
  end

  test '#messages' do
    expected_messages = [
      ['eastward_wind', GribApi::Level.new(400, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(450, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(500, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(550, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(600, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(650, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(700, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(750, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(800, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(850, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(900, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(925, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(950, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(975, 'isobaricInhPa')],
      ['eastward_wind', GribApi::Level.new(1000, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(400, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(450, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(500, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(550, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(600, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(650, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(700, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(750, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(800, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(850, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(900, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(925, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(950, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(975, 'isobaricInhPa')],
      ['geopotential_height', GribApi::Level.new(1000, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(400, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(450, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(500, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(550, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(600, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(650, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(700, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(750, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(800, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(850, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(900, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(925, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(950, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(975, 'isobaricInhPa')],
      ['northward_wind', GribApi::Level.new(1000, 'isobaricInhPa')],
    ]

    assert_equal(
      expected_messages,
      @file.messages.map { [_1.variable, _1.level] }.sort_by { |name, level| [name, level.level] }
    )
  end

  test 'Message#nearest_point' do
    nearest_point = @message.nearest_point(28.21975954, -82.15107322)

    assert_equal 28.25, nearest_point.lat
    assert_equal 277.75, nearest_point.lon
    assert_equal 1053.007875, nearest_point.value
    assert_equal 10.25846057, nearest_point.distance.truncate(8)
  end

  test 'Message#surrounding_points' do
    result = @message.surrounding_points(28.21975954, -82.15107322)

    assert_equal [28.25, 28.25, 28.0, 28.0], result.lats
    assert_equal [278.0, 277.75, 278.0, 277.75], result.lons
    assert_equal [1053.871875, 1053.007875, 1054.463875, 1053.855875], result.values
    assert_equal [15.17754275, 10.25846057, 28.57849134, 26.29288722], result.distances.map { _1.truncate(8) }
  end

  test 'Message#surrounding_points_outside_of_area' do
    assert_raises(GribApi::OutOfArea) { @message.surrounding_points(0, 0) }
  end
end
