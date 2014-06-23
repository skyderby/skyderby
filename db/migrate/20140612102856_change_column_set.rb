class ChangeColumnSet < ActiveRecord::Migration
  def change
      rename_column :points, :name, :fl_time
      change_column :points, :fl_time, :int
      add_column :points, :distance, :float
  end
end
