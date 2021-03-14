class CreateCompetitionSeriesRounds < ActiveRecord::Migration[6.0]
  def change
    create_table :competition_series_rounds do |t|
      t.belongs_to :competition_series, foreign_key: true
      t.integer :discipline, null: false, default: 0
      t.integer :number
      t.boolean :completed, null: false, default: false

      t.timestamps
    end
  end
end

