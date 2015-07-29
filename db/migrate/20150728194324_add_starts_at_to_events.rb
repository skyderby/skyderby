class AddStartsAtToEvents < ActiveRecord::Migration
  def change
    add_column :events, :starts_at, :date
  end
end
