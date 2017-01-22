module WeatherData
  class Default
    include ActiveModel::Conversion

    delegate :weather_data, to: :weather_datumable

    def initialize(weather_datumable)
      @weather_datumable = weather_datumable
    end

    private

    attr_reader :weather_datumable
  end
end
