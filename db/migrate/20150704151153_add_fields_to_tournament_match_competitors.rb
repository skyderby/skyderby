class AddFieldsToTournamentMatchCompetitors < ActiveRecord::Migration
  def change
    add_column :tournament_match_competitors, :is_winner, :boolean
    add_column :tournament_match_competitors, :is_disqualified, :boolean
    add_column :tournament_match_competitors, :is_lucky_looser, :boolean
    add_column :tournament_match_competitors, :notes, :string
  end
end
