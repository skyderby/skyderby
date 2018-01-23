class RemoveLastViewedAtFromTracks < ActiveRecord::Migration[5.1]
  def change
    rename_column :tracks, :lastviewed_at, :updated_at
  end
end
