class AddDisqualificationToTournamentCompetitor < ActiveRecord::Migration[5.1]
  def change
    add_column :tournament_competitors, :is_disqualified, :boolean
    add_column :tournament_competitors, :disqualification_reason, :string
  end
end
