class CreateTracksegments < ActiveRecord::Migration
  def change
    create_table :tracksegments do |t|
      t.references :track, index: true

      t.timestamps
    end
  end
end
