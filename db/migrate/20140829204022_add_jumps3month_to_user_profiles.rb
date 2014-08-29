class AddJumps3monthToUserProfiles < ActiveRecord::Migration
  def change
    add_column :user_profiles, :jumps_last_3m, :integer
    add_column :user_profiles, :jumps_wingsuit_last_3m, :integer
  end
end
