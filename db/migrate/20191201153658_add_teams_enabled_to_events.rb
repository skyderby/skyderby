class AddTeamsEnabledToEvents < ActiveRecord::Migration[5.2]
  def change
    add_column :events, :use_teams, :boolean, null: false, default: false
  end
end
