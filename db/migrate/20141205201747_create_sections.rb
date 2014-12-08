class CreateSections < ActiveRecord::Migration
  def change
    create_table :sections do |t|
      t.string :name
      t.integer :order
      t.references :event, index: true
    end
  end
end
