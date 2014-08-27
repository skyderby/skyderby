class AddWingsuitFields < ActiveRecord::Migration
  def change
    add_column :wingsuits, :name, :string
  end
end
