class RemoveColumnsFromProfile < ActiveRecord::Migration
  def change
    remove_column :user_profiles, :height
    remove_column :user_profiles, :homeDZ_name
    remove_column :user_profiles, :jumps_last_3m
    remove_column :user_profiles, :jumps_last_year
    remove_column :user_profiles, :jumps_total
    remove_column :user_profiles, :jumps_wingsuit
    remove_column :user_profiles, :jumps_wingsuit_last_3m
    remove_column :user_profiles, :jumps_wingsuit_last_year
    remove_column :user_profiles, :phone_number
    remove_column :user_profiles, :shirt_size
    remove_column :user_profiles, :weight
  end
end
