class AddCropCoordsToUserProfile < ActiveRecord::Migration
  def change
    add_column :user_profiles, :crop_x, :integer
    add_column :user_profiles, :crop_y, :integer
    add_column :user_profiles, :crop_w, :integer
    add_column :user_profiles, :crop_h, :integer
  end
end
