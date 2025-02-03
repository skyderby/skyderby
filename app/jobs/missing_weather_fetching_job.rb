class MissingWeatherFetchingJob < ApplicationJob
  class DownloadError < StandardError; end

  retry_on DownloadError, wait: 5.minutes, attempts: 3

  def perform(track_id)
    @track = Track.find_by(id: track_id)
    place = @track&.place
    return if !@track || @track.base? || !place

    return if place.weather_data.for_time(forecast_hour).exists?

    subregion = GfsForecast::Subregion.new(**Place.where(id: place).to_subregion)

    Rails.logger.info <<~MSG
      Fetching weather for track ##{track_id} #{forecast_hour.iso8601}
      Place: #{place.name} (#{place.latitude}, #{place.longitude})
      Subregion: #{subregion}
    MSG

    import_weather(place, forecast_hour, subregion)
  end

  private

  def forecast_hour
    @gps_time ||= @track.points.trimmed.first&.gps_time
    return if @gps_time.blank?

    @gps_time.beginning_of_hour
  end

  def import_weather(place, forecast_hour, subregion)
    result = GfsForecast.new(forecast_hour, subregion:, fallback_cycles: 1).download do |path|
      grib_file = GribApi.open(path)
      Rails.logger.info "Downloaded file #{path}."

      place.import_weather_from_gfs_file(grib_file)
    end

    return if result.success

    WeatherFetchingLog.create!(time:, error_description: result.errors)
    raise DownloadError, result.errors.join("\n")
  end
end
