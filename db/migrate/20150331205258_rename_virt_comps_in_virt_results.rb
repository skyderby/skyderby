class RenameVirtCompsInVirtResults < ActiveRecord::Migration
  def change
    rename_column :virtual_comp_results, :virtual_competitions_id, :virtual_competition_id
  end
end
