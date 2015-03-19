class RenameDropzonesToPlaces < ActiveRecord::Migration
  def change
    rename_table :dropzones, :places
    remove_column :places, :name_eng
  end
end
