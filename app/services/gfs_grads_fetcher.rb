require 'net/http'

# Fetching parameters
#
# hgtsfc  ** surface geopotential height [gpm]
#  - request params [time = 0..120][lat = 0..720][lon = 0..1439]
#
# hgtprs  ** (1000 975 950 925 900.. 7 5 3 2 1) geopotential height [gpm]
# ugrdprs ** (1000 975 950 925 900.. 7 5 3 2 1) u-component of wind [m/s]
# vgrdprs ** (1000 975 950 925 900.. 7 5 3 2 1) v-component of wind [m/s]
#  - request params [time = 0..120][lev = 0..30][lat = 0..720][lon = 0..1439]
#
# Longitude: 0.00000000000°E to 359.75000000000°E (1440 points, avg. res. 0.25°)
# Latitude: -90.00000000000°N to 90.00000000000°N (721 points, avg. res. 0.25°)
# Altitude:  1000.00000000000 to 1.00000000000 (31 points, avg. res. 33.3)
# Time: 00Z03JAN2017 to 00Z08JAN2017 (121 points, avg. res. 0.042 days)
# Time resolution ~ 1h (1.008h)
#
class GfsGradsFetcher
  LEVELS = '0:20'.freeze
  LAT_LON_RESOLUTION = 0.25

  VALUES = [:hgtsfc, :hgtprs, :ugrdprs, :vgrdprs].freeze

  def initialize(opts = {})
    @latitude = opts[:latitude]
    @longitude = opts[:longitude]
    @date_time = opts[:date_time] || Time.now.utc

    @dataset = Dataset.for(date_time)
  end

  def execute
    raw = fetch
    parsed = Parser.new(raw).execute
    Processor.new(parsed).execute
  end

  private

  def fetch
    threads =
      VALUES.map do |key|
        url = "#{dataset.url}?#{key}#{value_params(key)}"
        Thread.new do
          { key => Net::HTTP.get(URI.parse(url)) }
        end
      end

    threads.each(&:join).map(&:value).reduce({}, :merge)
  end

  def value_params(val_key)
    val_params = {
      hgtsfc: -> { "#{time_param}#{latitude_param}#{longitude_param}" },
      default: -> { "#{time_param}#{altitude_param}#{latitude_param}#{longitude_param}" }
    }

    (val_params[val_key] || val_params[:default]).call
  end

  def latitude_param
    start_latitude = -90
    "[#{((latitude - start_latitude) / LAT_LON_RESOLUTION).round}]"
  end

  def longitude_param
    "[#{(normalized_longitude / LAT_LON_RESOLUTION).round}]"
  end

  def altitude_param
    "[#{LEVELS}]"
  end

  def time_param
    "[#{(date_time.to_time - dataset.start_time.to_time).to_i / 1.hour.to_i}]"
  end

  def normalized_longitude
    longitude.negative? ? longitude + 360 : longitude
  end

  attr_reader :latitude, :longitude, :date_time, :dataset
end
