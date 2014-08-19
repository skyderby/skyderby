class CreateRounds < ActiveRecord::Migration
  def change
    create_table :rounds do |t|
      t.string :name
      t.references :event, index: true

      t.timestamps
    end
  end
end
