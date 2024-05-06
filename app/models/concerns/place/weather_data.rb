module Place::WeatherData
  extend ActiveSupport::Concern

  included do
    has_many :weather_data, dependent: :delete_all
  end

  def import_weather_from_gfs_file(file)
    weather_data_from_file(file)
      .then { |records| weather_data.insert_all(records) } # rubocop:disable Rails/SkipsModelValidations
  end

  def weather_data_from_file(file) # rubocop:disable Metrics/AbcSize
    actual_on = file.timestamp

    p file.messages.first.keys('time') # rubocop:disable Rails/Output
    weather_from_nearest_point(file)
      .group_by { _1[:level] }
      .map do |_, data_points|
        data = data_points.map { [_1[:variable], _1[:value]] }.to_h
        altitude = data['geopotential_height']
        wind_speed = Math.sqrt(data['eastward_wind']**2 + data['northward_wind']**2)
        wind_direction = Math.atan2(data['northward_wind'], data['eastward_wind']) * 180 / Math::PI + 180

        { place_id: id, actual_on:, altitude:, wind_speed:, wind_direction: }
      end
  end

  ##
  # Iterates over each message in the file, finds the nearest points
  # to the place's latitude and longitude, and then selects the data from
  # the closest point.
  #
  # @param file [GribApi::File] The file containing the messages to be processed.
  # @param place [Place] object containing the latitude and longitude
  #
  # @return [Array<Hash>] An array of hashes, each containing
  #   the variable, level, and value from the closest point.
  def weather_from_nearest_point(file)
    file.messages.map do |message|
      data = message.nearest_point(latitude, longitude)

      {
        variable: message.variable,
        level: message.level,
        value: data.value
      }
    end
  end
end
