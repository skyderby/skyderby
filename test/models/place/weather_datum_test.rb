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

describe Place::WeatherDatum do
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

  describe 'attributes' do
    it 'converts altitude from feets to meters' do
      weather_datum = build_weather_datum
      weather_datum.update!(altitude_in_units: 15_000, altitude_unit: 'ft')

      expect(weather_datum.altitude).to eq(4572)
    end

    it 'converts speed from kmh to ms' do
      weather_datum = build_weather_datum
      weather_datum.update!(wind_speed_in_units: 36, wind_speed_unit: 'kmh')

      expect(weather_datum.wind_speed).to eq(10)
    end
  end

  describe 'units conversions' do
    it 'altitude#convert_to' do
      weather_datum = build_weather_datum
      expect(weather_datum.altitude.respond_to?(:convert_to)).to be_truthy
    end

    it 'wind_speed#convert_to' do
      weather_datum = build_weather_datum
      expect(weather_datum.wind_speed.respond_to?(:convert_to)).to be_truthy
    end
  end

  def build_weather_datum
    create(:weather_datum)
  end
end
