class AddLocationToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :location, :string
    rename_column :tracks, :updated_at, :lastviewed_at
    remove_column :tracks, :gpx_file_name
    remove_column :tracks, :gpx_content_type
    remove_column :tracks, :gpx_file_size
    remove_column :tracks, :gpx_updated_at
  end
end
