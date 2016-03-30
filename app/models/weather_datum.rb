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
#  weather_datumable_type :string(255)
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#

class WeatherDatum < ActiveRecord::Base
  belongs_to :weather_datumable, polymorphic: true

  validates_presence_of :actual_on, :altitude, :wind_speed, :wind_direction

  validates_numericality_of :altitude, greater_than_or_equal_to: 0, allow_nil: true
  validates_numericality_of :wind_speed, greater_than_or_equal_to: 0, allow_nil: true
  validates_numericality_of :wind_direction, greater_than_or_equal_to: 0, less_than: 360, allow_nil: true
end
