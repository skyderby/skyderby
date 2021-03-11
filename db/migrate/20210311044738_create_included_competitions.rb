class CreateIncludedCompetitions < ActiveRecord::Migration[6.0]
  def change
    create_table :competition_series_included_competitions do |t|
      t.belongs_to :competition_series, foreign_key: true, index: false
      t.belongs_to :event, foreign_key: true, index: false

      t.timestamps
    end
  end
end
