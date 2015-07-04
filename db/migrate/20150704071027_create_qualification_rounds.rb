class CreateQualificationRounds < ActiveRecord::Migration
  def change
    create_table :qualification_rounds do |t|
      t.references :tournament, index: true
      t.integer :order

      t.timestamps null: false
    end
  end
end
