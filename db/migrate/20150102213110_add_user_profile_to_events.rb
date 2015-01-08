class AddUserProfileToEvents < ActiveRecord::Migration
  def change
    add_reference :events, :user_profile
  end
end
