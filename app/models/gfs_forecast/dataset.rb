class GfsForecast::Dataset
  attr_reader :date, :cycle, :forecast_hour, :error

  def initialize(date, cycle, forecast_hour, subregion)
    @date = date
    @cycle = cycle
    @forecast_hour = forecast_hour
    @subregion = subregion
  end

  def available?
    uri = URI.parse(url)
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      head_request = Net::HTTP::Head.new(uri)
      head_response = http.request(head_request)
      return true if head_response.code == '200'

      get_request = Net::HTTP::Get.new(uri)
      get_response = http.request(get_request)
      @error = get_response.body

      false
    end
  end

  def url
    'https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25_1hr.pl?' \
      "#{params.to_query}&#{variables.to_query}&#{levels.to_query}&#{@subregion.to_query}"
  end

  def params = { dir:, file: }

  ##
  # @return [String] /gfs.YYYYMMDD/00/atmos
  def dir = "/gfs.#{@date.strftime('%Y%m%d')}/#{@cycle}/atmos"

  ##
  # @return [String] gfs.tCCz.pgrb2.0p25.fXXX
  #   where CC is the cycle, X is the forecast hour which is number of hours since the cycle hour
  def file = "gfs.t#{@cycle}z.pgrb2.0p25.f#{@forecast_hour.to_s.rjust(3, '0')}"

  def variables
    {
      var_HGT: 'on',
      var_UGRD: 'on',
      var_VGRD: 'on'
    }
  end

  def levels
    {
      lev_1000_mb: 'on',
      lev_400_mb: 'on',
      lev_450_mb: 'on',
      lev_500_mb: 'on',
      lev_550_mb: 'on',
      lev_600_mb: 'on',
      lev_650_mb: 'on',
      lev_700_mb: 'on',
      lev_750_mb: 'on',
      lev_800_mb: 'on',
      lev_850_mb: 'on',
      lev_900_mb: 'on',
      lev_925_mb: 'on',
      lev_950_mb: 'on',
      lev_975_mb: 'on',
    }
  end
end
