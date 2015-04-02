class AddRangeToVirtualCompetitions < ActiveRecord::Migration
  def change
    add_column :virtual_competitions, :range_from, :integer
    add_column :virtual_competitions, :range_to, :integer
  end
end
