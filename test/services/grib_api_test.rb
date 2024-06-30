require 'test_helper'

class GribApiTest < ActiveSupport::TestCase
  setup do
    @file = GribApi.open(file_fixture('2024_03_16_gfs.t00z.pgrb2.0p25.anl'))
  end

  test '#time' do
    assert_equal(
      Time.new(2024, 3, 16, 0, 0, 0, '+00:00'),
      GribApi.open(file_fixture('2024_03_16_gfs.t00z.pgrb2.0p25.anl')).timestamp
    )
    assert_equal(
      Time.new(2024, 3, 8, 18, 0, 0, '+00:00'),
      GribApi.open(file_fixture('gfs.t18z.pgrb2.0p25.anl')).timestamp
    )
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
      ['northward_wind', GribApi::Level.new(1000, 'isobaricInhPa')]
    ]

    assert_equal(
      expected_messages,
      @file.messages.map { [_1.variable, _1.level] }.sort_by { |name, level| [name, level.level] }
    )
  end
end
