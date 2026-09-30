class CreateTrackSensorSamples < ActiveRecord::Migration[8.1]
  def change
    create_table :track_sensor_samples do |t|
      t.references :track, null: false, type: :integer, foreign_key: { on_delete: :cascade }, index: false
      t.decimal :gps_time_in_seconds, precision: 17, scale: 3, null: false
      t.float :ax, null: false
      t.float :ay, null: false
      t.float :az, null: false
      t.index [:track_id, :gps_time_in_seconds]
    end
  end
end
