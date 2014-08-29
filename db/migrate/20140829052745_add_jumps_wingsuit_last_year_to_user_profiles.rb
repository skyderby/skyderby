class AddJumpsWingsuitLastYearToUserProfiles < ActiveRecord::Migration
  def change
    add_column :user_profiles, :jumps_wingsuit_last_year, :integer
  end
end
