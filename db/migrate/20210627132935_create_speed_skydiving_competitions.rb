class CreateSpeedSkydivingCompetitions < ActiveRecord::Migration[6.0]
  def change
    create_table :speed_skydiving_competitions do |t|
      t.string :name
      t.date :starts_at
      t.integer :status, null: false, default: 0
      t.integer :visibility, null: false, default: 0
      t.boolean :is_official, null: false, default: false
      t.boolean :use_teams, null: false, default: false

      t.belongs_to :responsible, foreign_key: { to_table: :users }
      t.belongs_to :place, foreign_key: true

      t.timestamps
    end
  end
end
