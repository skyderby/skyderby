class ChangeCoordsTypeInPlaces < ActiveRecord::Migration
  def change
    change_column :places, :latitude, :decimal, precision: 15, scale: 10
    change_column :places, :longitude, :decimal, precision: 15, scale: 10
  end
end
