class RemoveInformationFromPlace < ActiveRecord::Migration[5.1]
  def change
    remove_column :places, :information
  end
end
