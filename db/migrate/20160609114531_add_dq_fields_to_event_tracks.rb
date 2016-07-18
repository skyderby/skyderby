class AddDqFieldsToEventTracks < ActiveRecord::Migration
  def change
    add_column :event_tracks, :is_disqualified, :boolean, default: :false
    add_column :event_tracks, :disqualification_reason, :string

    execute(<<-UPDATE_SQL)
      UPDATE event_tracks
        SET is_disqualified = false
    UPDATE_SQL
  end
end
