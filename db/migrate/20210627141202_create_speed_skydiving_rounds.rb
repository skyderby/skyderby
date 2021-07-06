class CreateSpeedSkydivingRounds < ActiveRecord::Migration[6.0]
  def change
    create_table :speed_skydiving_competition_rounds do |t|
      t.integer :number, null: false, default: 1

      t.belongs_to :event, foreign_key: { to_table: :speed_skydiving_competitions }

      t.timestamps
    end
  end
end
