class RemoveUnusedFieldsFromProfiles < ActiveRecord::Migration[5.0]
  def change
    remove_column :profiles, :facebook_profile, :string
    remove_column :profiles, :vk_profile, :string
    remove_column :profiles, :crop_x, :integer
    remove_column :profiles, :crop_y, :integer
    remove_column :profiles, :crop_h, :integer
    remove_column :profiles, :crop_w, :integer
    remove_column :profiles, :dropzone_id, :integer
  end
end
