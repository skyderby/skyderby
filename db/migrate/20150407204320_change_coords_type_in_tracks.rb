class ChangeCoordsTypeInTracks < ActiveRecord::Migration
  def change
    change_column :points, :latitude, :decimal, precision: 15, scale: 10
    change_column :points, :longitude, :decimal, precision: 15, scale: 10
  end
end
