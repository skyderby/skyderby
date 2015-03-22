class AddUserProfileToTrack < ActiveRecord::Migration
  def change
    add_reference :tracks, :user_profile
  end
end
