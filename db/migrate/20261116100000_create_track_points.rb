class CreateTrackPoints < ActiveRecord::Migration[8.1]
  ARRAY_COLUMNS = {
    track_points: %w[gps_time latitude longitude abs_altitude elevation distance h_speed v_speed
                     horizontal_accuracy vertical_accuracy speed_accuracy],
    track_sensor_series: %w[gps_time ax ay az]
  }.freeze

  def change
    create_table :track_points, primary_key: :track_id, id: :integer, default: nil do |t| # rubocop:disable Rails/CreateTableWithTimestamps
      t.timestamptz :gps_time, array: true, null: false
      t.decimal :latitude, precision: 15, scale: 10, array: true, null: false
      t.decimal :longitude, precision: 15, scale: 10, array: true, null: false
      t.float :abs_altitude, array: true
      t.float :elevation, array: true
      t.float :distance, array: true, null: false
      t.float :h_speed, array: true, null: false
      t.float :v_speed, array: true, null: false
      t.column :horizontal_accuracy, :real, array: true
      t.column :vertical_accuracy, :real, array: true
      t.column :speed_accuracy, :real, array: true
    end

    create_table :track_sensor_series, primary_key: :track_id, id: :integer, default: nil do |t| # rubocop:disable Rails/CreateTableWithTimestamps
      t.timestamptz :gps_time, array: true, null: false
      t.column :ax, :real, array: true, null: false
      t.column :ay, :real, array: true, null: false
      t.column :az, :real, array: true, null: false
    end

    add_foreign_key :track_points, :tracks, on_delete: :cascade
    add_foreign_key :track_sensor_series, :tracks, on_delete: :cascade

    reversible do |dir|
      dir.up do
        ARRAY_COLUMNS.each do |table, columns|
          columns.each { |column| execute "ALTER TABLE #{table} ALTER COLUMN #{column} SET COMPRESSION lz4" }
        end
      end
    end
  end
end
