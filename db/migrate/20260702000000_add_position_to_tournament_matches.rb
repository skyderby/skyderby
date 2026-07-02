class AddPositionToTournamentMatches < ActiveRecord::Migration[8.1]
  def up
    add_column :tournament_matches, :position, :integer

    execute <<~SQL.squish
      UPDATE tournament_matches tm
      SET position = sub.rn
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY round_id ORDER BY created_at, id
               ) AS rn
        FROM tournament_matches
      ) sub
      WHERE tm.id = sub.id
    SQL
  end

  def down
    remove_column :tournament_matches, :position
  end
end
