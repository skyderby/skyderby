class AddFieldsToVirtualCompetitions < ActiveRecord::Migration
  def change
    add_column :virtual_competitions, :display_highest_speed, :boolean
    add_column :virtual_competitions, :display_highest_gr, :boolean
    add_column :virtual_comp_results, :highest_speed, :float
    add_column :virtual_comp_results, :highest_gr, :float
  end
end
