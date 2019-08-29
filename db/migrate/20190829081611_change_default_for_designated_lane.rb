class ChangeDefaultForDesignatedLane < ActiveRecord::Migration[5.2]
  def change
    change_column :events, :designated_lane_start, :integer, default: 1
  end
end
