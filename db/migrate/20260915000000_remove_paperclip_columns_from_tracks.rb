class RemovePaperclipColumnsFromTracks < ActiveRecord::Migration[8.1]
  def change
    change_table :tracks, bulk: true do |t|
      t.remove :file_file_name, type: :string, limit: 510
      t.remove :file_content_type, type: :string, limit: 510
      t.remove :file_file_size, type: :integer
      t.remove :file_updated_at, type: :timestamptz
    end

    change_table :track_files, bulk: true do |t|
      t.remove :file_file_name, type: :string, limit: 510
      t.remove :file_content_type, type: :string, limit: 510
      t.remove :file_file_size, type: :integer
      t.remove :file_updated_at, type: :timestamptz
    end
  end
end
