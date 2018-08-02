class AddDesignatedLaneStartToEvents < ActiveRecord::Migration[5.2]
  def change
    add_column :events, :designated_lane_start, :integer, null: false, default: 0
  end
end
