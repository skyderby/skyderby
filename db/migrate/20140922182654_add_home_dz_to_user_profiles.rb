class AddHomeDzToUserProfiles < ActiveRecord::Migration
  def change
    add_reference :user_profiles, :dropzone
  end
end
