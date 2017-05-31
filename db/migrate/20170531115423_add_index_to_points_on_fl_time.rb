class AddIndexToPointsOnFlTime < ActiveRecord::Migration[5.0]
  def change
    add_index :points, [:track_id, :fl_time]
  end
end
