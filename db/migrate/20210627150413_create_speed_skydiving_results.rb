class CreateSpeedSkydivingResults < ActiveRecord::Migration[6.0]
  def change
    create_table :speed_skydiving_competition_results do |t|
      t.belongs_to :event, foreign_key: { to_table: :speed_skydiving_competitions }
      t.belongs_to :round, foreign_key: { to_table: :speed_skydiving_competition_rounds }
      t.belongs_to :competitor, foreign_key: { to_table: :speed_skydiving_competition_competitors }
      t.belongs_to :track, foreign_key: true

      t.decimal :result, precision: 10, scale: 5

      t.timestamps
    end
  end
end
