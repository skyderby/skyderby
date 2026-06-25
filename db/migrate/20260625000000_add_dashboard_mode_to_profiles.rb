class AddDashboardModeToProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :profiles, :dashboard_mode, :string
  end
end
