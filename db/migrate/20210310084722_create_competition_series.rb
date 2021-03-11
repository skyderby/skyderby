class CreateCompetitionSeries < ActiveRecord::Migration[6.0]
  def change
    create_table :competition_series do |t|
      t.string :name
      t.integer :status, null: false, default: 0
      t.integer :visibility, null: false, default: 0
      t.references :responsible, foreign_key: { to_table: :users }, index: false

      t.timestamps
    end
  end
end
