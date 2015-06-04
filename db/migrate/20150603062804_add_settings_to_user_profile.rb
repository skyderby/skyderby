class AddSettingsToUserProfile < ActiveRecord::Migration
  def change
    add_column :user_profiles, :default_units, :integer, default: 0
    add_column :user_profiles, :default_chart_view, :integer, default: 0
  end
end
