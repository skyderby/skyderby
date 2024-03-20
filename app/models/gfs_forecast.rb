class GfsForecast
  def self.latest(actual_on = Time.current)
    new(actual_on).download
  end

  def initialize(actual_on)
    @actual_on = actual_on
  end

  def download

  end

  def url
    "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25_1hr.pl?"
  end

  def params
    {
      dir: "/gfs.20240316/00/atmos",
      file: "gfs.t00z.pgrb2.0p25.anl",
    }
  end

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
      lev_975_mb: 'on',
      lev_950_mb: 'on',
      lev_925_mb: 'on',
      lev_900_mb: 'on',
      lev_850_mb: 'on',
      lev_800_mb: 'on',
      lev_750_mb: 'on',
      lev_700_mb: 'on',
      lev_650_mb: 'on',
      lev_600_mb: 'on',
      lev_550_mb: 'on',
      lev_500_mb: 'on',
      lev_450_mb: 'on',
      lev_400_mb: 'on'
    }
  end

  # TODO: test for leftlon, rightlon
  # and convert to 0-360 from -180-180
  def subregion
    toplat, bottomlat, leftlon, rightlon = Place.pluck(
      'ceil(max(latitude))',
      'floor(min(latitude))',
      'min(longitude)',
      'max(longitude)'
    )

    {
      subregion: '',
      toplat:,
      leftlon:,
      rightlon:,
      bottomlat:
    }
  end
end
