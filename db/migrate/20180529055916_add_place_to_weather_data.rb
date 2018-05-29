class AddPlaceToWeatherData < ActiveRecord::Migration[5.2]
  def up
    add_reference :weather_data, :place, foreign_key: true
    add_index :weather_data, [:place_id, :actual_on]

    execute <<~SQL
      UPDATE weather_data
      SET place_id = weather_datumable_id
      WHERE weather_datumable_type = 'Place'
    SQL

    rename_table :weather_data, :place_weather_data
  end

  def down
    rename_table :place_weather_data, :weather_data

    remove_index :weather_data, [:place_id, :actual_on]
    remove_reference :weather_data, :place
  end
end
