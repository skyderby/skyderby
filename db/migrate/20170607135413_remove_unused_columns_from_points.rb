class RemoveUnusedColumnsFromPoints < ActiveRecord::Migration[5.0]
  def change
    change_table :points, bulk: true do |t|
      t.remove_timestamps
      t.remove :point_created_at
    end
  end
end
