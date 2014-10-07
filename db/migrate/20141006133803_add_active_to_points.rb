class AddActiveToPoints < ActiveRecord::Migration
  def change
    add_column :points, :active, :boolean
  end
end
