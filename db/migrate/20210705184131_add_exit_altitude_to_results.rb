class AddExitAltitudeToResults < ActiveRecord::Migration[6.0]
  def change
    add_column :speed_skydiving_competition_results, :exit_altitude, :float
  end
end
