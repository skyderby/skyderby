class AddVisibilityToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :visibility, :integer, default: 0
  end
end
