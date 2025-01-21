class WeatherFetchingJob < ApplicationJob
  class DownloadError < StandardError; end

  retry_on DownloadError, wait: 5.minutes, attempts: 10

  def perform(time_in_seconds) # rubocop:disable Metrics/AbcSize
    time = Time.zone.at(time_in_seconds).beginning_of_hour + 1.hour
    Rails.logger.info("Fetching weather for #{time.iso8601}. Subregion: #{subregion}")

    result = GfsForecast.new(time, subregion:, fallback_cycles: 1).download do |path|
      grib_file = GribApi.open(path)
      Rails.logger.info("Downloaded file #{path}. ")

      Place.skydive.each do |place|
        next if place.weather_forecasts.exists?(actual_on: time)

        place.import_weather_from_gfs_file(grib_file)
      end
    end

    return if result.success

    WeatherFetchingLog.create!(time:, errors: result.errors)
    raise DownloadError, result.errors.join("\n")
  end

  private

  def subregion
    @subregion ||= GfsForecast::Subregion.new(**Place.skydive.to_subregion)
  end
end

Sidekiq.configure_server do
  Sidekiq::Cron::Job.create(
    name: 'Fetch weather - every hour',
    cron: '30 * * * *',
    class: 'WeatherFetchingJob',
    date_as_argument: true
  )
end
