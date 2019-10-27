class AddFileDataToTrackFile < ActiveRecord::Migration[5.2]
  def change
    add_column :track_files, :file_data, :jsonb
  end
end
