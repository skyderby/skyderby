class RenameFinishLinesToPlaceFinishLines < ActiveRecord::Migration[5.2]
  def change
    rename_table :finish_lines, :place_finish_lines
  end
end
