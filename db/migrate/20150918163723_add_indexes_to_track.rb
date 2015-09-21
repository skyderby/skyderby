class AddIndexesToTrack < ActiveRecord::Migration
  def change
    add_index :tracks, :place_id
    add_index :tracks, :wingsuit_id
    add_index :tracks, :user_profile_id
  end
end
