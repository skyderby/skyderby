class AddVisibilityToTournaments < ActiveRecord::Migration[8.1]
  def change
    add_column :tournaments, :visibility, :integer, null: false, default: 0
  end
end
