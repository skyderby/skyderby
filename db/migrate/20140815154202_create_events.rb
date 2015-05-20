class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.string :name
      t.string :place

      t.datetime :start_at
      t.datetime :end_at

      t.integer :comp_range_from
      t.integer :comp_range_to

      t.text :descriprion

      t.timestamps
    end
  end
end
