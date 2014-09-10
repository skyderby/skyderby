class AddResultToEventTracks < ActiveRecord::Migration
  def change
    add_column :event_tracks, :result, :float
  end
end
