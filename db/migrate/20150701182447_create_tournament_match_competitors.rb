class CreateTournamentMatchCompetitors < ActiveRecord::Migration
  def change
    create_table :tournament_match_competitors do |t|
      t.decimal :result, precision: 10, scale: 3
      t.references :tournament_competitor
      t.references :tournament_match
      t.references :track

      t.timestamps null: false
    end
  end
end
