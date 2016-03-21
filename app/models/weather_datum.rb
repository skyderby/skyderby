class WeatherDatum < ActiveRecord::Base
  belongs_to :weather_datumable, polymorphic: true

  validates_inclusion_of :wind_direction, in: 0..359
end
