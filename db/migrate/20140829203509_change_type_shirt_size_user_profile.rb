class ChangeTypeShirtSizeUserProfile < ActiveRecord::Migration
  def change
    remove_column :user_profiles, :shirt_size
    add_column :user_profiles, :shirt_size, :string
    add_column :user_profiles, :facebook_profile, :string
    add_column :user_profiles, :vk_profile, :string
  end
end
