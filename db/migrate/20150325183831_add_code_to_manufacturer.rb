class AddCodeToManufacturer < ActiveRecord::Migration
  def change
    add_column :manufacturers, :code, :string
  end
end
