class AddGroupToVirtualCompetitions < ActiveRecord::Migration
  def change
    add_reference :virtual_competitions, :virtual_comp_group
  end
end
