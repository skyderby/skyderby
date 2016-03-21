class CreateWeatherData < ActiveRecord::Migration
  def change
    create_table :weather_data do |t|
      t.datetime :actual_on
      t.decimal :altitude, precision: 10, scale: 4
      t.decimal :wind_speed, precision: 10, scale: 4
      t.decimal :wind_direction, precision: 5, scale: 2
      t.belongs_to :weather_datumable, polymorphic: true

      t.timestamps null: false
    end

    add_index :weather_data,
              [:weather_datumable_id, :weather_datumable_type],
              name: 'weather_data_pk_index'
  end
end
