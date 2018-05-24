class RenameVirtualCompetitionGroup < ActiveRecord::Migration[5.2]
  def change
    rename_table :virtual_comp_groups, :virtual_competition_groups
    rename_column :virtual_competitions, :virtual_comp_group_id, :group_id
  end
end
