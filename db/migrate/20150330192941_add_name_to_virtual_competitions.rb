class AddNameToVirtualCompetitions < ActiveRecord::Migration
  def change
    add_column :virtual_competitions, :name, :string
  end
end
