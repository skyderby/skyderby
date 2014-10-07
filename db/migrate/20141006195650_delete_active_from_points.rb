class DeleteActiveFromPoints < ActiveRecord::Migration
  def change
    remove_column :points, :active
    add_column :tracks, :ff_start, :integer
    add_column :tracks, :ff_end, :integer
  end
end
