class AddFinalsBoolToTournamentMatches < ActiveRecord::Migration
  def change
    add_column :tournament_matches, :gold_finals, :boolean, default: false
    add_column :tournament_matches, :bronze_finals, :boolean, default: false
  end
end
