require 'open-uri'
require 'fileutils'

class GfsForecast
  Subregion = Data.define(:top_lat, :bottom_lat, :left_lon, :right_lon) do
    def to_s = "Lat #{bottom_lat}..#{top_lat}, Lon: #{left_lon}..#{right_lon}"

    def to_query
      "subregion=&toplat=#{top_lat}&bottomlat=#{bottom_lat}&leftlon=#{left_lon}&rightlon=#{right_lon}"
    end
  end

  EntireWorld = Subregion.new(top_lat: 90, bottom_lat: -90, left_lon: 0, right_lon: 360)

  Result = Data.define(:success, :errors)

  def initialize(forecast_time, subregion: EntireWorld, fallback_cycles: 0)
    @forecast_time = forecast_time
    @subregion = subregion
    @fallback_cycles = fallback_cycles
  end

  def download(&)
    dataset, errors = available_dataset

    if dataset
      download_dataset(dataset, &)
      success
    else
      failure(errors)
    end
  end

  def download_dataset(dataset)
    FileUtils.mkdir_p(Rails.root.join('tmp/gfs_forecasts/'))
    path = "tmp/gfs_forecasts/#{dataset.file}"

    io = URI.parse(dataset.url).open
    case io
    when StringIO
      File.binwrite(path, io.read)
    when Tempfile
      io.close
      FileUtils.mv(io.path, path)
    end

    yield(path)
  ensure
    FileUtils.rm_f(path)
  end

  def success = Result.new(success: true, errors: [])

  def failure(errors) = Result.new(success: false, errors:)

  ##
  # @return [GfsForecast::Dataset | nil, Array<Hash>]
  def available_dataset
    errors = []
    datasets.each do |dataset|
      return [dataset, errors] if dataset.available?

      errors << <<~ERROR
        Dataset #{dataset.params} is not available. Server Response:
        #{dataset.error}
      ERROR
    end

    [nil, errors]
  end

  def datasets
    @datasets ||= begin
      params = [current_cycle_params] + previous_cycle_params
      params.map { Dataset.new(_1[:date], _1[:cycle], _1[:forecast_hour], @subregion) }
    end
  end

  def current_cycle_params
    {
      date: @forecast_time.to_date,
      cycle: (@forecast_time.hour / 6 * 6).to_s.rjust(2, '0'),
      forecast_hour: @forecast_time.hour % 6
    }
  end

  def previous_cycle_params
    Array.new(@fallback_cycles) do |i|
      fallback_cycle = i + 1
      fallback_time = @forecast_time - (fallback_cycle * 6).hours
      {
        date: fallback_time.to_date,
        cycle: (fallback_time.hour / 6 * 6).to_s.rjust(2, '0'),
        forecast_hour: fallback_time.hour % 6 + fallback_cycle * 6
      }
    end
  end
end
