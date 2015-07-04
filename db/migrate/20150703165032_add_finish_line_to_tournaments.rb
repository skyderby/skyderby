class AddFinishLineToTournaments < ActiveRecord::Migration
  def change
    add_column :tournaments, :finish_start_lat, :decimal, precision: 15, scale: 10
    add_column :tournaments, :finish_start_lon, :decimal, precision: 15, scale: 10
    add_column :tournaments, :finish_end_lat, :decimal, precision: 15, scale: 10
    add_column :tournaments, :finish_end_lon, :decimal, precision: 15, scale: 10
  end
end
