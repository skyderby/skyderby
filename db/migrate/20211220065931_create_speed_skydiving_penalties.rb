class CreateSpeedSkydivingPenalties < ActiveRecord::Migration[6.0]
  def change
    create_table :speed_skydiving_competition_result_penalties do |t|
      t.belongs_to :result, foreign_key: { to_table: :speed_skydiving_competition_results }
      t.integer :percent
      t.string :reason

      t.timestamps null: false
    end
  end
end
