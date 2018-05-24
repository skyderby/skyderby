class CreateFinishLines < ActiveRecord::Migration[5.2]
  def change
    create_table :finish_lines do |t|
      t.belongs_to :place, foreign_key: true
      t.string :name
      t.decimal :start_latitude,  precision: 15, scale: 10
      t.decimal :start_longitude, precision: 15, scale: 10
      t.decimal :end_latitude,    precision: 15, scale: 10
      t.decimal :end_longitude,   precision: 15, scale: 10

      t.timestamps
    end
  end
end
