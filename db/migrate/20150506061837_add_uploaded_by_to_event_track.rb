class AddUploadedByToEventTrack < ActiveRecord::Migration
  def change
    add_reference :event_tracks, :user_profile, index: true
  end
end
