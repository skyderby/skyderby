class CreateTracks < ActiveRecord::Migration
  def change
    create_table :tracks do |t|
      t.string :name

      t.timestamps
    end
    add_attachment :tracks, :gpx
  end
end
