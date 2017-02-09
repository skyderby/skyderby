class AddForeignKeyToEventTrackOnTrack < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :event_tracks, :tracks
  end
end
