class RemoveWrongColumnProfile < ActiveRecord::Migration
  def change
    remove_reference :user_profiles, :users
  end
end
