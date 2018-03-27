class AddPenaltyToEventTrack < ActiveRecord::Migration[5.1]
  def up
    add_column :event_tracks, :penalized, :boolean, null: false, default: false
    add_column :event_tracks, :penalty_size, :integer
    rename_column :event_tracks, :disqualification_reason, :penalty_reason

    execute(<<~SQL)
      UPDATE event_tracks
      SET penalized = true, penalty_size = 100
      WHERE is_disqualified
    SQL

    remove_column :event_tracks, :is_disqualified
  end

  def down
    add_column :event_tracks, :is_disqualified, :boolean, null: false, default: false
    rename_column :event_tracks, :penalty_reason, :disqualification_reason

    execute(<<~SQL)
      UPDATE event_tracks
      SET is_disqualified = true
      WHERE penalized = true
    SQL

    remove_column :event_tracks, :penalized
    remove_column :event_tracks, :penalty_size
  end
end
