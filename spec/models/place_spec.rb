describe Place do
  let(:country) { countries(:norway) }
  let(:place) { Place.create!(name: 'Gridset', country: country, latitude: 1, longitude: 2) }

  let(:valid_attributes) do
    {
      name: 'Some place, ie Gridset',
      country: country,
      latitude: 10,
      longitude: -10,
      msl: 12
    }
  end

  context 'required fields' do
    it 'requires country' do
      expect(Place.create(valid_attributes.merge(country: nil))).not_to be_valid
    end

    it 'requires name' do
      expect(Place.create(valid_attributes.merge(name: nil))).not_to be_valid
    end

    it 'requires latitude' do
      expect(Place.create(valid_attributes.merge(latitude: nil))).not_to be_valid
    end

    it 'requires longitude' do
      expect(Place.create(valid_attributes.merge(longitude: nil))).not_to be_valid
    end
  end

  it '.import_weather_from_gfs_file' do
    place = places(:z_hills)
    file = GribApi.open(file_fixture('2024_03_16_gfs.t00z.pgrb2.0p25.anl'))

    place.import_weather_from_gfs_file(file)

    weather_data =
      place.weather_data.ordered.for_time('2024-03-16 00:00:00').pluck(
        'round(altitude)',
        Arel.sql('round(wind_speed, 1)'),
        'round(wind_direction)'
      )

    expect(weather_data).to contain_exactly(
      [138, 5.0, 164],
      [360, 4.2, 189],
      [586, 4.0, 224],
      [817, 3.6, 244],
      [1053, 3.2, 277],
      [1541, 3.0, 274],
      [2053, 6.1, 195],
      [2592, 6.7, 200],
      [3162, 8.7, 201],
      [3769, 11.1, 204],
      [4416, 12.2, 196],
      [5105, 14.7, 187],
      [5850, 20.8, 189],
      [6659, 23.7, 182],
      [7543, 25.7, 186]
    )
  end

  describe '.search' do
    it 'by country name' do
      expect(Place.search('no')).to include(place)
    end

    it 'by name' do
      expect(Place.search('ri')).to include(place)
    end
  end

  it '.nearby' do
    track = tracks(:hellesylt)
    place = Place.create! \
      name: 'Lookup',
      country: countries(:norway),
      latitude: 20.001,
      longitude: 30.001

    point = Point.create!(track: track, latitude: 20.0015, longitude: 30.0015)

    expect(Place.nearby(point, 1)).to include(place)
  end
end
