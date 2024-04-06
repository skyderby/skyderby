# frozen_string_literal: true

describe GfsForecast, :vcr do
  it '#cycle' do
    expect(GfsForecast.new(Time.zone.parse('2021-03-01T03:00:00Z')).datasets[0].cycle).to eq('00')
    expect(GfsForecast.new(Time.zone.parse('2021-03-01T12:00:00Z')).datasets[0].cycle).to eq('12')
    expect(GfsForecast.new(Time.zone.parse('2021-03-01T23:59:59Z')).datasets[0].cycle).to eq('18')
  end

  it '#dir' do
    expect(GfsForecast.new(Time.zone.parse('2021-03-01T03:00:00Z')).datasets[0].dir).to eq('/gfs.20210301/00/atmos')
  end

  it '#file' do
    expect(GfsForecast.new(Time.zone.parse('2021-03-01T03:00:00Z')).datasets[0].file).to eq('gfs.t00z.pgrb2.0p25.f003')
    expect(GfsForecast.new(Time.zone.parse('2021-03-01T12:00:00Z')).datasets[0].file).to eq('gfs.t12z.pgrb2.0p25.f000')
  end

  it '#url' do
    subregion = GfsForecast::Subregion.new(top_lat: 67, bottom_lat: -35, left_lon: 10, right_lon: 40)
    url = GfsForecast.new(Time.zone.parse('2021-03-01T03:00:00Z'), subregion:).datasets[0].url

    expect(url).to eq \
      'https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25_1hr.pl?' \
      'dir=%2Fgfs.20210301%2F00%2Fatmos&file=gfs.t00z.pgrb2.0p25.f003&' \
      'var_HGT=on&var_UGRD=on&var_VGRD=on&' \
      'lev_1000_mb=on&lev_400_mb=on&lev_450_mb=on&lev_500_mb=on&lev_550_mb=on&' \
      'lev_600_mb=on&lev_650_mb=on&lev_700_mb=on&lev_750_mb=on&lev_800_mb=on&' \
      'lev_850_mb=on&lev_900_mb=on&lev_925_mb=on&lev_950_mb=on&lev_975_mb=on&' \
      'subregion=&toplat=67&bottomlat=-35&leftlon=10&rightlon=40' \
  end

  describe '#datasets' do
    it 'without fallback cycles' do
      datasets = GfsForecast.new(Time.zone.parse('2021-03-01T03:00:00Z')).datasets
      expect(datasets.size).to eq(1)
      expect(datasets.first.cycle).to eq('00')
      expect(datasets.first.forecast_hour).to eq(3)
    end

    it 'with two fallback cycles' do
      datasets = GfsForecast.new(Time.zone.parse('2021-03-01T03:00:00Z'), fallback_cycles: 2).datasets
      expect(datasets.size).to eq(3)
      times = datasets.map do |dataset|
        { date: dataset.date.iso8601, cycle: dataset.cycle, hour: dataset.forecast_hour }
      end

      expect(times).to eq(
        [
          { date: '2021-03-01', cycle: '00', hour: 3 },
          { date: '2021-02-28', cycle: '18', hour: 9 },
          { date: '2021-02-28', cycle: '12', hour: 15 }
        ]
      )
    end
  end

  it '#download unavailable file from the past' do
    VCR.use_cassette('gfs_forecast/request_for_old_data') do
      result = GfsForecast.new(Time.zone.parse('1990-03-01T03:00:00Z')).download
      expect(result.success).to eq(false)
      expect(result.errors.size).to eq(1)
      error = result.errors.first
      expect(error).to include(
        'Dataset {:dir=>"/gfs.19900301/00/atmos", :file=>"gfs.t00z.pgrb2.0p25.f003"} is not available.'
      )
      expect(error).to include('This data has expired and is no longer available.')
    end
  end

  it '#download unavailable file from the future' do
    VCR.use_cassette('gfs_forecast/request_for_future_data') do
      result = GfsForecast.new(Time.zone.parse('2055-03-01T03:00:00Z')).download
      expect(result.success).to eq(false)
      expect(result.errors.size).to eq(1)
      error = result.errors.first
      expect(error).to include(
        'Dataset {:dir=>"/gfs.20550301/00/atmos", :file=>"gfs.t00z.pgrb2.0p25.f003"} is not available.'
      )
      expect(error).to include('data file is not present')
    end
  end

  it '#download with wrong parameter value' do
    time = Time.zone.parse('2024-03-25T03:00:00Z')
    subregion = GfsForecast::Subregion.new(top_lat: 'aa', bottom_lat: 'bbb', left_lon: 10, right_lon: 40)

    VCR.use_cassette('gfs_forecast/request_with_invalid_parameter') do
      result = GfsForecast.new(time, subregion:).download
      expect(result.success).to eq(false)
      expect(result.errors.size).to eq(1)
      error = result.errors.first
      expect(error).to include(
        'Dataset {:dir=>"/gfs.20240325/00/atmos", :file=>"gfs.t00z.pgrb2.0p25.f003"} is not available.'
      )
      expect(error).to include('toplat value is not numeric: aa')
    end
  end

  it '#download' do
    time = Time.zone.parse('2024-03-29T03:00:00Z')
    subregion = GfsForecast::Subregion.new(top_lat: 28.25, bottom_lat: 27.25, left_lon: 277.0, right_lon: 277.75)

    VCR.use_cassette('gfs_forecast/valid_request_for_data') do
      GfsForecast.new(time, subregion:).download do |file_path|
        grib_file = GribApi.open(file_path)
        expect(grib_file.timestamp).to eq(Time.zone.parse('2024-03-29T00:00:00Z'))
      end
    end
  end

  it '#download with fallback', :aggregate_failures do
    time = Time.zone.parse('2024-03-31T04:00:00Z')
    subregion = GfsForecast::Subregion.new(top_lat: 28.25, bottom_lat: 27.25, left_lon: 277.0, right_lon: 277.75)

    VCR.use_cassette('gfs_forecast/download_with_fallback') do
      result = GfsForecast.new(time, subregion:, fallback_cycles: 1).download do |file_path|
        grib_file = GribApi.open(file_path)
        expect(grib_file.timestamp).to eq(Time.zone.parse('2024-03-30T18:00:00Z'))
      end

      expect(result.success).to eq(true)
      expect(result.errors).to eq([])
    end
  end
end
