class CreateQualificationJumps < ActiveRecord::Migration
  def change
    create_table :qualification_jumps do |t|
      t.references :qualification_round
      t.references :tournament_competitor
      t.decimal :result, precision: 10, scale: 3
      t.references :track

      t.timestamps null: false
    end
  end
end
