class RemoveUnusedIndexes < ActiveRecord::Migration[5.2]
  def up
    remove_index :points, [:track_id, :fl_time] if index_exists?(:points, [:track_id, :fl_time])

    remove_index :place_weather_data, :place_id
    remove_index :place_weather_data, name: 'weather_data_pk_index'
    remove_column :place_weather_data, :weather_datumable_id
    remove_column :place_weather_data, :weather_datumable_type
  end

  def down
    add_index :points, [:track_id, :fl_time]

    add_index :place_weather_data, :place_id
    add_column :place_weather_data, :weather_datumable_id, :integer
    add_column :place_weather_data, :weather_datumable_type, :string
    add_index :place_weather_data, [:weather_datumable_id, :weather_datumable_type], name: 'weather_data_pk_index'
  end
end
