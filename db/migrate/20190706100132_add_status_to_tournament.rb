class AddStatusToTournament < ActiveRecord::Migration[5.2]
  def change
    add_column :tournaments, :status, :integer, null: false, default: 0
  end
end
