class AddLocationToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :location, :string
    rename_column :tracks, :updated_at, :lastviewed_at
  end
end
