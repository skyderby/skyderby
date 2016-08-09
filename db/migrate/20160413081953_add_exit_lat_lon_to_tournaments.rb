class AddExitLatLonToTournaments < ActiveRecord::Migration
  def change
    add_column :tournaments, :exit_lat, :decimal, precision: 15, scale: 10
    add_column :tournaments, :exit_lon, :decimal, precision: 15, scale: 10
  end
end
