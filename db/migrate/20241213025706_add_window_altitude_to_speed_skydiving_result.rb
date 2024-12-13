class AddWindowAltitudeToSpeedSkydivingResult < ActiveRecord::Migration[7.1]
  def change
    add_column :speed_skydiving_competition_results, :window_start_altitude, :decimal, precision: 10, scale: 3
    add_column :speed_skydiving_competition_results, :window_end_altitude, :decimal, precision: 10, scale: 3
  end
end
