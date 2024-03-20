class WeatherFetchingJob < ApplicationJob
  def perform
    # download file
    # - cycle 00 06 12 18
    # - in each cycle extract forecast for every hour
    # - variables are:
    #    - var_HGT=on
    #    - var_UGRD=on
    #    - var_VGRD=on
    # - levels are:
    #    - lev_2_m_above_ground=on
    #    - lev_10_m_above_ground=on
    #    - lev_20_m_above_ground=on
    #    - lev_30_m_above_ground=on
    #    - lev_40_m_above_ground=on
    #    - lev_50_m_above_ground=on
    #    - lev_80_m_above_ground=on
    #    - lev_100_m_above_ground=on
    #    - lev_1000_m_above_ground=on
    #    - lev_1829_m_above_mean_sea_level=on
    #    - lev_2743_m_above_mean_sea_level=on
    #    - lev_3000-0_m_above_ground=on
    #    - lev_3658_m_above_mean_sea_level=on
    #    - lev_4000_m_above_ground=on
    #    - lev_6000-0_m_above_ground=on
    #
    # sample url:
    # https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25_1hr.pl?dir=%2Fgfs.20240308%2F18%2Fatmos&file=gfs.t18z.pgrb2.0p25.anl&var_HGT=on&var_UGRD=on&var_VGRD=on&lev_2_m_above_ground=on&lev_10_m_above_ground=on&lev_20_m_above_ground=on&lev_30_m_above_ground=on&lev_40_m_above_ground=on&lev_50_m_above_ground=on&lev_80_m_above_ground=on&lev_100_m_above_ground=on&lev_1000_m_above_ground=on&lev_4000_m_above_ground=on&lev_1829_m_above_mean_sea_level=on&lev_2743_m_above_mean_sea_level=on&lev_3658_m_above_mean_sea_level=on&lev_3000-0_m_above_ground=on&lev_6000-0_m_above_ground=on
    #
    # iterate over skydive places, extract data for every hour and save it to the database
    # if error happens log it and continue with the next place
    # every day send email with the summary of the errors if there are any
    # where do I start?
    # This job will call Place::WeatherDatum.download_forecast
    # Place::WeatherDatum.download_forecast will create WeatherDatum::Dataset for date and cycle
    # and call download on it
    # once download is finished it will iterate over all places and save the data to the database

    # requires eccodes
    # /opt/homebrew/Cellar/eccodes/2.34.1/share
    # bundle config build.rb-grib --with-grib_api-dir=/opt/homebrew/Cellar/eccodes/2.34.1 --without-grib_apilib
    # example bindings
    # https://github.com/sandorkertesz/skinnywms/blob/3405485bf52ef627edc14fff8c4bef2182a0f29d/skinnywms/grib_bindings/bindings.py#L388
    next_hour = Time.current.beginning_of_hour + 1.hour

    Place.skydive.each do |place|
      PlaceWeatherFetchingJob.perform_later(place.id, next_hour.iso8601)
    end
  end
end

if Rails.env.production?
  Sidekiq::Cron::Job.create(
    name: 'Fetch weather - every hour',
    cron: '30 * * * *',
    class: 'WeatherFetchingJob'
  )
end
