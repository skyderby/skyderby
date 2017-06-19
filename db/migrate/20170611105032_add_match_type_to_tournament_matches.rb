class AddMatchTypeToTournamentMatches < ActiveRecord::Migration[5.0]
  def up
    add_column :tournament_matches, :match_type, :integer, default: 0, null: false

    execute <<~SQL
      UPDATE tournament_matches
      SET match_type = CASE
        WHEN gold_finals THEN 1
        WHEN bronze_finals THEN 2
        ELSE 0
      END
    SQL

    remove_column :tournament_matches, :gold_finals
    remove_column :tournament_matches, :bronze_finals
  end

  def down
    add_column :tournament_matches, :gold_finals, :boolean, default: false
    add_column :tournament_matches, :bronze_finals, :boolean, default: false

    execute <<~SQL
      UPDATE tournament_matches
      SET gold_finals = CASE WHEN match_type = 1 THEN true ELSE false END,
          bronze_finals = CASE WHEN match_type = 2 THEN true ELSE false END
    SQL

    remove_column :tournament_matches, :match_type
  end
end
