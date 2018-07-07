class RenameTournamentReferences < ActiveRecord::Migration[5.2]
  def change
    rename_column :tournament_matches, :tournament_round_id, :round_id
    rename_table :tournament_match_competitors, :tournament_match_slots
    rename_column :tournament_match_slots, :tournament_match_id, :match_id
    rename_column :tournament_match_slots, :tournament_competitor_id, :competitor_id
    rename_column :qualification_jumps, :tournament_competitor_id, :competitor_id
  end
end
