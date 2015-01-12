class SetDefaultStatusToEvent < ActiveRecord::Migration
  def change
    change_column :events, :status, :integer, default: 0
  end
end
