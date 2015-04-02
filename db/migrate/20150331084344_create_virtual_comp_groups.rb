class CreateVirtualCompGroups < ActiveRecord::Migration
  def change
    create_table :virtual_comp_groups do |t|
      t.string :name

      t.timestamps
    end
  end
end
