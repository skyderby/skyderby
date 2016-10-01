class ConvertMslFromIntegerToDecimal < ActiveRecord::Migration
  def change
    change_column :places, :msl, :decimal, precision: 5, scale: 1
    change_column :tracks, :ground_level, :decimal, precision: 5, scale: 1
  end
end
