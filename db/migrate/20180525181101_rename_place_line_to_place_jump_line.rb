class RenamePlaceLineToPlaceJumpLine < ActiveRecord::Migration[5.2]
  def change
    rename_table :place_lines, :place_jump_lines
    rename_table :exit_measurements, :place_jump_line_measurements
    rename_column :place_jump_line_measurements, :place_line_id, :jump_line_id
  end
end
