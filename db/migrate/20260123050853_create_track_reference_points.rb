class CreateTrackReferencePoints < ActiveRecord::Migration[7.1]
  def change
    create_table :track_reference_points do |t|
      t.references :track, null: false, foreign_key: true, index: { unique: true }
      t.decimal :latitude, precision: 15, scale: 10, null: false
      t.decimal :longitude, precision: 15, scale: 10, null: false

      t.timestamps
    end
  end
end
