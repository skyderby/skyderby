class AddLaneValidationStopsAtToEvents < ActiveRecord::Migration[7.1]
  def change
    add_column :events, :lane_validation_stops_at, :integer, default: 0, null: false
  end
end
