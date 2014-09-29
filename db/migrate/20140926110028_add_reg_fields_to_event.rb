class AddRegFieldsToEvent < ActiveRecord::Migration
  def change
    add_column :events, :reg_starts, :date
    add_column :events, :reg_ends, :date
  end
end
