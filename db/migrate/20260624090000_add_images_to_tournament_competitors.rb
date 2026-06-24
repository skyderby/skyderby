class AddImagesToTournamentCompetitors < ActiveRecord::Migration[8.1]
  def change
    change_table :tournament_competitors, bulk: true do |t|
      t.jsonb :photo_data
      t.jsonb :sponsor_logo_data
    end
  end
end
