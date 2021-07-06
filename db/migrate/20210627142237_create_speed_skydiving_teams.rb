class CreateSpeedSkydivingTeams < ActiveRecord::Migration[6.0]
  def change
    create_table :speed_skydiving_competition_teams do |t|
      t.string :name, null: false

      t.belongs_to :event, foreign_key: { to_table: :speed_skydiving_competitions }

      t.timestamps
    end
  end
end
