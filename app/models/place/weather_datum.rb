# == Schema Information
#
# Table name: weather_data
#
#  id                     :integer          not null, primary key
#  actual_on              :datetime
#  altitude               :decimal(10, 4)
#  wind_speed             :decimal(10, 4)
#  wind_direction         :decimal(5, 2)
#  weather_datumable_id   :integer
#  weather_datumable_type :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#

class Place::WeatherDatum < ApplicationRecord
  attr_accessor :altitude_unit, :wind_speed_unit
  attr_reader :altitude_in_units, :wind_speed_in_units

  belongs_to :place

  before_save :set_altitude, :set_wind_speed

  validates :actual_on, :wind_direction, presence: true
  validate :altitude_present?
  validate :wind_speed_present?

  validates :altitude,
            :altitude_in_units,
            :wind_speed,
            :wind_speed_in_units,
            numericality: { greater_than_or_equal_to: 0, allow_nil: true }

  validates :wind_direction, numericality: { greater_than_or_equal_to: 0,
                                             less_than: 360,
                                             allow_nil: true }

  serialize :altitude, Distance
  serialize :wind_speed, Velocity

  scope :for_time, ->(time) { where(actual_on: time) }
  default_scope -> { order(:actual_on, :altitude) }

  def wind_speed_in_units=(value)
    @wind_speed_in_units = value_from_param(value)
  end

  def altitude_in_units=(value)
    @altitude_in_units = value_from_param(value)
  end

  private

  def value_from_param(value)
    return nil if value.is_a?(String) && value.empty?

    value
  end

  def altitude_present?
    return if altitude.present? || altitude_in_units.present?

    errors.add :altitude, :blank
  end

  def wind_speed_present?
    return if wind_speed.present? || wind_speed_in_units.present?

    errors.add :wind_speed, :blank
  end

  def set_altitude
    return if altitude_in_units.blank? || altitude_unit.blank?

    self.altitude = Distance.new(altitude_in_units, altitude_unit)
  end

  def set_wind_speed
    return if wind_speed_in_units.blank? || wind_speed_unit.blank?

    self.wind_speed = Velocity.new(wind_speed_in_units, wind_speed_unit)
  end
end
