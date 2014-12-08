class AddStatusToEvent < ActiveRecord::Migration
  def change
    add_column :events, :status, :integer, default: 0
  end
end
