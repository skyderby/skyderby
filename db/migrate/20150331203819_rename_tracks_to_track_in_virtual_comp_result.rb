class RenameTracksToTrackInVirtualCompResult < ActiveRecord::Migration
  def change
    rename_column :virtual_comp_results, :tracks_id, :track_id
  end
end
