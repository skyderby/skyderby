class CreateSpeedSkydivingCompetitors < ActiveRecord::Migration[6.0]
  def change
    create_table :speed_skydiving_competition_competitors do |t|
      t.belongs_to :event, foreign_key: { to_table: :speed_skydiving_competitions }
      t.belongs_to :category, foreign_key: { to_table: :speed_skydiving_competition_categories }
      t.belongs_to :profile, foreign_key: true
      t.belongs_to :team, foreign_key: { to_table: :speed_skydiving_competition_teams }
      t.integer :assigned_number

      t.timestamps
    end
  end
end
