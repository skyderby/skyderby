class AddPrivateNoteToTracks < ActiveRecord::Migration[8.1]
  def change
    add_column :tracks, :private_note, :text
  end
end
