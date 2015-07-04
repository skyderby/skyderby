class CreateTournamentMatches < ActiveRecord::Migration
  def change
    create_table :tournament_matches do |t|
      t.decimal :start_time, precision: 17, scale: 3
      t.references :tournament_round, index: true

      t.timestamps null: false
    end
  end
end
