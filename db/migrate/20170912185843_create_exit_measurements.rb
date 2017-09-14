class CreateExitMeasurements < ActiveRecord::Migration[5.1]
  def change
    create_table :exit_measurements do |t|
      t.belongs_to :place, foreign_key: true
      t.integer :altitude
      t.integer :distance
    end
  end
end
