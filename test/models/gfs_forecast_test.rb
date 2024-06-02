require 'test_helper'

class GfsForecastTest < ActiveSupport::TestCase
  def setup
    @forecast = GfsForecast.new(Time.zone.parse('2021-03-01T03:00:00Z'))
  end

  test 'cycle' do
    assert_equal '00', @forecast.datasets[0].cycle
    assert_equal '12', GfsForecast.new(Time.zone.parse('2021-03-01T12:00:00Z')).datasets[0].cycle
    assert_equal '18', GfsForecast.new(Time.zone.parse('2021-03-01T23:59:59Z')).datasets[0].cycle
  end

  test 'dir' do
    assert_equal '/gfs.20210301/00/atmos', @forecast.datasets[0].dir
  end

  test 'file' do
    assert_equal 'gfs.t00z.pgrb2.0p25.f003', @forecast.datasets[0].file
    assert_equal 'gfs.t12z.pgrb2.0p25.f000', GfsForecast.new(Time.zone.parse('2021-03-01T12:00:00Z')).datasets[0].file
  end

  test 'url' do
    subregion = GfsForecast::Subregion.new(top_lat: 67, bottom_lat: -35, left_lon: 10, right_lon: 40)
    url = GfsForecast.new(Time.zone.parse('2021-03-01T03:00:00Z'), subregion: subregion).datasets[0].url

    assert_equal \
      'https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25_1hr.pl?' \
      'dir=%2Fgfs.20210301%2F00%2Fatmos&file=gfs.t00z.pgrb2.0p25.f003&' \
      'var_HGT=on&var_UGRD=on&var_VGRD=on&' \
      'lev_1000_mb=on&lev_400_mb=on&lev_450_mb=on&lev_500_mb=on&lev_550_mb=on&' \
      'lev_600_mb=on&lev_650_mb=on&lev_700_mb=on&lev_750_mb=on&lev_800_mb=on&' \
      'lev_850_mb=on&lev_900_mb=on&lev_925_mb=on&lev_950_mb=on&lev_975_mb=on&' \
      'subregion=&toplat=67&bottomlat=-35&leftlon=10&rightlon=40', url
  end

  test 'datasets without fallback cycles' do
    datasets = @forecast.datasets
    assert_equal 1, datasets.size
    assert_equal '00', datasets.first.cycle
    assert_equal 3, datasets.first.forecast_hour
  end

  test 'datasets with two fallback cycles' do
    datasets = GfsForecast.new(Time.zone.parse('2021-03-01T03:00:00Z'), fallback_cycles: 2).datasets
    assert_equal 3, datasets.size
    times = datasets.map do |dataset|
      { date: dataset.date.iso8601, cycle: dataset.cycle, hour: dataset.forecast_hour }
    end

    assert_equal [
      { date: '2021-03-01', cycle: '00', hour: 3 },
      { date: '2021-02-28', cycle: '18', hour: 9 },
      { date: '2021-02-28', cycle: '12', hour: 15 }
    ], times
  end

  test 'download unavailable file from the past' do
    VCR.use_cassette('gfs_forecast/request_for_old_data') do
      result = GfsForecast.new(Time.zone.parse('1990-03-01T03:00:00Z')).download
      assert_not result.success
      assert_equal 1, result.errors.size
      error = result.errors.first
      assert_includes error, 'Dataset {:dir=>"/gfs.19900301/00/atmos", :file=>"gfs.t00z.pgrb2.0p25.f003"} is not available.'
      assert_includes error, 'This data has expired and is no longer available.'
    end
  end

  test 'download unavailable file from the future' do
    VCR.use_cassette('gfs_forecast/request_for_future_data') do
      result = GfsForecast.new(Time.zone.parse('2055-03-01T03:00:00Z')).download
      assert_not result.success
      assert_equal 1, result.errors.size
      error = result.errors.first
      assert_includes error, 'Dataset {:dir=>"/gfs.20550301/00/atmos", :file=>"gfs.t00z.pgrb2.0p25.f003"} is not available.'
      assert_includes error, 'data file is not present'
    end
  end

  test 'download with wrong parameter value' do
    time = Time.zone.parse('2024-03-25T03:00:00Z')
    subregion = GfsForecast::Subregion.new(top_lat: 'aa', bottom_lat: 'bbb', left_lon: 10, right_lon: 40)

    VCR.use_cassette('gfs_forecast/request_with_invalid_parameter') do
      result = GfsForecast.new(time, subregion: subregion).download
      assert_not result.success
      assert_equal 1, result.errors.size
      error = result.errors.first
      assert_includes error, 'Dataset {:dir=>"/gfs.20240325/00/atmos", :file=>"gfs.t00z.pgrb2.0p25.f003"} is not available.'
      assert_includes error, 'toplat value is not numeric: aa'
    end
  end

  test 'download' do
    time = Time.zone.parse('2024-03-29T03:00:00Z')
    subregion = GfsForecast::Subregion.new(top_lat: 28.25, bottom_lat: 27.25, left_lon: 277.0, right_lon: 277.75)

    VCR.use_cassette('gfs_forecast/valid_request_for_data') do
      GfsForecast.new(time, subregion: subregion).download do |file_path|
        grib_file = GribApi.open(file_path)
        assert_equal Time.zone.parse('2024-03-29T03:00:00Z'), grib_file.timestamp
      end
    end
  end

  test 'download with fallback' do
    time = Time.zone.parse('2024-03-31T04:00:00Z')
    subregion = GfsForecast::Subregion.new(top_lat: 28.25, bottom_lat: 27.25, left_lon: 277.0, right_lon: 277.75)

    VCR.use_cassette('gfs_forecast/download_with_fallback') do
      result = GfsForecast.new(time, subregion: subregion, fallback_cycles: 1).download do |file_path|
        grib_file = GribApi.open(file_path)
        assert_equal Time.zone.parse('2024-03-31T04:00:00Z'), grib_file.timestamp
      end

      assert result.success
      assert_empty result.errors
    end
  end
end
