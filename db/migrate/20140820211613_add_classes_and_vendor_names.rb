class AddClassesAndVendorNames < ActiveRecord::Migration
  def change
    add_column :manufacturers, :name, :string
    add_column :ws_classes, :name, :string
  end
end
