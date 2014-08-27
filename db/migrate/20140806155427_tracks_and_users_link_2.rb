class TracksAndUsersLink2 < ActiveRecord::Migration
  def change
    remove_column :tracks, :user_id
    add_reference :tracks, :user, index: true
  end
end
