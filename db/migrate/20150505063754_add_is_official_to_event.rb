class AddIsOfficialToEvent < ActiveRecord::Migration
  def change
    add_column :events, :is_official, :boolean, default: false
  end
end
