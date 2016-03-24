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

  validates :actual_on, presence: true
  validates_inclusion_of :wind_direction, in: 0..359
end
