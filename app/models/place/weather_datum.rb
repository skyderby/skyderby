class Place::WeatherDatum < ApplicationRecord
  belongs_to :place

  validates :actual_on, :wind_direction, presence: true
  validates :altitude, :wind_speed, numericality: { greater_than_or_equal_to: 0 }
  validates :wind_direction, numericality: { greater_than_or_equal_to: 0, less_than: 360 }

  scope :for_time, ->(time) { where(actual_on: time) }
  scope :ordered, -> { order(:actual_on, :altitude) }
end
