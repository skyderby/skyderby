class AddHomeDzNameToUserProfiles < ActiveRecord::Migration
  def change
    add_column :user_profiles, :homeDZ_name, :string
  end
end
