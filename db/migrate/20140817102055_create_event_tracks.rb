class CreateEventTracks < ActiveRecord::Migration
  def change
    create_table :event_tracks do |t|
      t.references :round, index: true
      t.references :track

      t.timestamps
    end
  end
end
