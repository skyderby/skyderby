class AddGroundLevelToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :ground_level, :integer, default: 0
  end
end
