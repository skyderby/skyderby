class AddMslToPlaces < ActiveRecord::Migration
  def change
    add_column :places, :msl, :integer
  end
end
