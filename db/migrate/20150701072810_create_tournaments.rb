class CreateTournaments < ActiveRecord::Migration
  def change
    create_table :tournaments do |t|
      t.string :name
      t.references :place
      t.integer :discipline

      t.timestamps null: false
    end
  end
end
