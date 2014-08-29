class AddPhoneToUserProfiles < ActiveRecord::Migration
  def change
    add_column :user_profiles, :phone_number, :string
  end
end
