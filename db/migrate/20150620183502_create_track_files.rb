class CreateTrackFiles < ActiveRecord::Migration
  def change
    create_table :track_files do |t|
      t.attachment :file

      t.timestamps null: false
    end

    add_reference :tracks, :track_file
  end
end
