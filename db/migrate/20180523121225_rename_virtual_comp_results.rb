class RenameVirtualCompResults < ActiveRecord::Migration[5.2]
  def change
    rename_table :virtual_comp_results, :virtual_competition_results
  end
end
