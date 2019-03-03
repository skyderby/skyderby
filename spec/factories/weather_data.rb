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

FactoryBot.define do
  factory :weather_datum, class: Place::WeatherDatum do
    place

    actual_on Time.current.beginning_of_day
    altitude { rand(0..4000) }
    wind_speed { rand(0..25) }
    wind_direction { rand(0..359) }
  end
end
