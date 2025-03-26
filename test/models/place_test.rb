require 'test_helper'

class PlaceTest < ActiveSupport::TestCase
  setup do
    @country = countries(:norway)
    @place = Place.create!(name: 'Gridset', country: @country, latitude: 1, longitude: 2)

    @valid_attributes = {
      name: 'Some place, ie Gridset',
      country: @country,
      latitude: 10,
      longitude: -10,
      msl: 12
    }
  end

  test 'validations' do
    assert_not Place.new(@valid_attributes.merge(country: nil)).valid?
    assert_not Place.new(@valid_attributes.merge(name: nil)).valid?
    assert_not Place.new(@valid_attributes.merge(latitude: nil)).valid?
    assert_not Place.new(@valid_attributes.merge(longitude: nil)).valid?
  end

  test 'import_weather_from_gfs_file' do
    place = places(:z_hills)
    file = GribApi.open(file_fixture('2024_03_16_gfs.t00z.pgrb2.0p25.anl'))

    place.import_weather_from_gfs_file(file)

    weather_data =
      place.weather_data.ordered.for_time('2024-03-16 00:00:00').pluck(
        'round(altitude)',
        Arel.sql('round(wind_speed, 1)'),
        'round(wind_direction)'
      )

    assert_equal(
      [
        [138, 5.0, 286],
        [360, 4.2, 261],
        [586, 4.0, 226],
        [817, 3.6, 206],
        [1053, 3.2, 173],
        [1541, 3.0, 176],
        [2053, 6.1, 255],
        [2592, 6.7, 250],
        [3162, 8.7, 249],
        [3769, 11.1, 246],
        [4416, 12.2, 254],
        [5105, 14.7, 263],
        [5850, 20.8, 261],
        [6659, 23.7, 268],
        [7543, 25.7, 264]
      ],
      weather_data
    )
  end

  test 'search by country name' do
    assert_includes Place.search('no'), @place
  end

  test 'search by name' do
    assert_includes Place.search('ri'), @place
  end

  test 'nearby' do
    track = tracks(:hellesylt)
    place = Place.create! \
      name: 'Lookup',
      country: countries(:norway),
      latitude: 20.001,
      longitude: 30.001

    point = Point.create!(track: track, latitude: 20.0015, longitude: 30.0015)

    assert_includes Place.nearby(point, 1), place
  end
end
