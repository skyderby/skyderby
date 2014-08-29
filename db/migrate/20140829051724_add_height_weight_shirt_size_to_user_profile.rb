class AddHeightWeightShirtSizeToUserProfile < ActiveRecord::Migration
  def change
    add_column :user_profiles, :height, :integer
    add_column :user_profiles, :weight, :integer
    add_column :user_profiles, :shirt_size, :integer
  end
end
