class RemoveUnusedFieldsFromProfiles < ActiveRecord::Migration[5.0]
  def change
    remove_column :profiles, :facebook_profile
    remove_column :profiles, :vk_profile
    remove_column :profiles, :crop_x
    remove_column :profiles, :crop_y
    remove_column :profiles, :crop_h
    remove_column :profiles, :crop_w
    remove_column :profiles, :dropzone_id
  end
end
