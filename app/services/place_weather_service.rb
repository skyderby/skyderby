class PlaceWeatherService
  def initialize(opts)
    @place = opts[:place]
    @date_time = (opts[:date_time] || Time.now.utc).beginning_of_hour
  end

  def execute
    return if data_exists?

    gfs_data = GfsGradsFetcher.new(
      latitude: place.latitude,
      longitude: place.longitude,
      date_time: date_time
    ).execute

    record_weather_data gfs_data
  rescue GfsGradsFetcher::Dataset::NoDatasetAvailable, GfsGradsFetcher::Dataset::DateOutOfRange
    Rails.logger.info "No dataset available for #{place.name} at #{date_time}"
  end

  private

  attr_reader :place, :date_time

  def data_exists?
    place.weather_data.for_time(date_time).any?
  end

  def record_weather_data(gfs_data)
    gfs_data.each do |datum|
      params = datum.merge(actual_on: date_time)
      place.weather_data.create!(params)
    end
  end
end
