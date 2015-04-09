class AddFlySightSupportToPoints < ActiveRecord::Migration
  def self.up
    # # Never used column
    remove_column :points, :description
    add_column :tracks, :gps_type, :integer, default: 0
    change_column :points, :fl_time, :float
  end

  def self.down
    add_column :points, :description, :string
    remove_column :tracks, :gps_type
    change_column :points, :fl_time, :integer
  end
end
