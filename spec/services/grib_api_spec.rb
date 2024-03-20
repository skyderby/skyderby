describe GribApi do
  let(:file) { GribApi.open(file_fixture('gfs.t00z.pgrb2.0p25-2.anl')) }

  describe GribApi::File do
    it '#time' do
      expect(GribApi.open(file_fixture('gfs.t00z.pgrb2.0p25-2.anl')).timestamp)
        .to eq(Time.new(2024, 3, 16, 0, 0, 0, '+00:00'))
      expect(GribApi.open(file_fixture('gfs.t18z.pgrb2.0p25.anl')).timestamp)
        .to eq(Time.new(2024, 3, 8, 18, 0, 0, '+00:00'))
    end

    it '#message_count' do
      expect(file.message_count).to eq(45)
    end

    it '#messages' do
      expect(file.messages.map { [_1.variable, _1.level] }).to contain_exactly(
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
      )
    end
  end

  describe GribApi::Message do
    it '#nearest_points' do
      message = file.messages.find do |message|
        message.level == GribApi::Level.new(900, 'isobaricInhPa') &&
          message.variable == 'geopotential_height'
      end
      result = message.nearest_points(28.21975954, -82.15107322)

      expect(result.lats).to eq([28.25, 28.25, 28.0, 28.0])
      expect(result.lons).to eq([278.0, 277.75, 278.0, 277.75])
      expect(result.values).to eq([1053.871875, 1053.007875, 1054.463875, 1053.855875])
      expect(result.distances).to eq([15.177542758974615, 10.258460571724717, 28.5784913417286, 26.292887228481522])
    end
  end
end
