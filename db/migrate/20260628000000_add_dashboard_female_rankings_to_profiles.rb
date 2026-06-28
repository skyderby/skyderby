class AddDashboardFemaleRankingsToProfiles < ActiveRecord::Migration[8.1]
  def change
    add_column :profiles, :dashboard_female_rankings, :boolean, default: false, null: false
  end
end
