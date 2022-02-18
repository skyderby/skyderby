class CreateSpeedSkydivingCompetitionSeries < ActiveRecord::Migration[6.0]
  def change
    create_table :speed_skydiving_competition_series do |t|
      t.string :name, null: false
      t.integer :status, null: false, default: 0
      t.integer :visibility, null: false, default: 0
      t.belongs_to :responsible

      t.timestamps null: false
    end

    create_table :speed_skydiving_competition_series_included_competitions do |t|
      t.belongs_to :speed_skydiving_competition_series,
                   index: { name: :index_included_competitions_on_competition_series_id }
      t.belongs_to :speed_skydiving_competition,
                   index: { name: :index_included_competitions_on_competition_id }

      t.timestamps null: false
    end

    create_table :speed_skydiving_competition_series_rounds do |t|
      t.belongs_to :speed_skydiving_competition_series,
                   index: { name: :index_rounds_on_speed_skydiving_competition_series_id }
      t.integer :number, null: false
      t.datetime :completed_at

      t.timestamps null: false
    end
  end
end
