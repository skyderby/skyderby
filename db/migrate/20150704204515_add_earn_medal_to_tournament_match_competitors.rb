class AddEarnMedalToTournamentMatchCompetitors < ActiveRecord::Migration
  def change
    add_column :tournament_match_competitors, :earn_medal, :integer
  end
end
