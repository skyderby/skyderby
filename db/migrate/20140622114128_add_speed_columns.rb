class AddSpeedColumns < ActiveRecord::Migration
  def change
    add_column :points, :v_speed, :float
    add_column :points, :h_speed, :float
  end
end
