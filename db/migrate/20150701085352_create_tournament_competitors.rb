class CreateTournamentCompetitors < ActiveRecord::Migration
  def change
    create_table :tournament_competitors do |t|
      t.references :tournament, index: true
      t.references :user_profile
      t.references :wingsuit

      t.timestamps null: false
    end
  end
end
