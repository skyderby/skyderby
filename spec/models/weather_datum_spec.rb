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
#  weather_datumable_type :string(510)
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#

require 'spec_helper'

describe WeatherDatum, type: :model do
  describe 'validations' do
    it 'fails validation with no actual on date' do
      weather_datum = build_weather_datum
      weather_datum.actual_on = nil

      expect(weather_datum).to be_invalid
    end

    it 'fails validation with no altitude given' do
      weather_datum = build_weather_datum
      weather_datum.altitude = nil
      weather_datum.altitude_in_units = nil

      expect(weather_datum).to be_invalid
    end

    it 'fails validation with no altitude and incorrect altitude_in_units' do
      weather_datum = build_weather_datum
      weather_datum.altitude = nil
      weather_datum.altitude_in_units = 'abc'

      expect(weather_datum).to be_invalid
      expect(weather_datum.errors[:altitude_in_units].size).to eq(1)
    end

    it 'fails validation with no wind speed given' do
      weather_datum = build_weather_datum
      weather_datum.wind_speed = nil
      weather_datum.wind_speed_in_units = nil

      expect(weather_datum).to be_invalid
      expect(weather_datum.errors[:wind_speed].size).to eq(1)
    end

    it 'fails validation with no wind speed and incorrect wind speed in units' do
      weather_datum = build_weather_datum
      weather_datum.wind_speed = nil
      weather_datum.wind_speed_in_units = 'abc'

      expect(weather_datum).to be_invalid
      expect(weather_datum.errors[:wind_speed_in_units].size).to eq(1)
    end

    it 'fails validations with wind direction less than 0 and greater than 359' do
      weather_datum = build_weather_datum
      weather_datum.wind_direction = -10

      expect(weather_datum).to be_invalid
      expect(weather_datum.errors[:wind_direction].size).to eq(1)

      weather_datum.wind_direction = 500
      expect(weather_datum).to be_invalid
      expect(weather_datum.errors[:wind_direction].size).to eq(1)
    end
  end

  describe 'serializable attributes' do
    it 'has altitude as a Distance' do
      weather_datum = build_weather_datum

      expect(weather_datum.altitude.class).to eq(Distance)
    end

    it 'has wind_speed as a Velocity' do
      weather_datum = build_weather_datum

      expect(weather_datum.wind_speed.class).to eq(Velocity)
    end
  end

  def build_weather_datum
    create(:weather_datum)
  end
end
