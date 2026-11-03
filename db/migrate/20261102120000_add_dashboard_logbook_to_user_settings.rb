class AddDashboardLogbookToUserSettings < ActiveRecord::Migration[8.1]
  def change
    add_column :user_settings, :dashboard_logbook, :boolean, null: false, default: true
  end
end
