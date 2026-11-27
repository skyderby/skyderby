class DropPoints < ActiveRecord::Migration[8.1]
  def change
    drop_table :points, id: :serial do |t|
      t.float :abs_altitude
      t.float :distance
      t.float :elevation
      t.float :fl_time
      t.integer :gps_fix
      t.decimal :gps_time_in_seconds, precision: 17, scale: 3
      t.float :h_speed
      t.float :heading
      t.float :heading_accuracy
      t.float :horizontal_accuracy
      t.decimal :latitude, precision: 15, scale: 10
      t.decimal :longitude, precision: 15, scale: 10
      t.integer :number_of_satellites
      t.float :speed_accuracy
      t.integer :track_id, index: true
      t.float :v_speed
      t.float :vertical_accuracy
    end
  end
end
