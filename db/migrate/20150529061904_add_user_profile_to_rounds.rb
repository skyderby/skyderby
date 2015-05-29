class AddUserProfileToRounds < ActiveRecord::Migration
  def change
    add_reference :rounds, :user_profile
  end
end
