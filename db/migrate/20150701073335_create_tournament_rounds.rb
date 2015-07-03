class CreateTournamentRounds < ActiveRecord::Migration
  def change
    create_table :tournament_rounds do |t|
      t.integer :order
      t.references :tournament, index: true

      t.timestamps null: false
    end
  end
end
