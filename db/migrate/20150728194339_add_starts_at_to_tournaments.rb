class AddStartsAtToTournaments < ActiveRecord::Migration
  def change
    add_column :tournaments, :starts_at, :date
  end
end
