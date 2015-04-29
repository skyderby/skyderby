class ChangePlacesTypeInEvents < ActiveRecord::Migration
  def self.up
    remove_column :events, :place
    add_reference :events, :place
  end

  def self.down
    remove_column :events, :place_id
    add_column :events, :place, :string
  end
end
