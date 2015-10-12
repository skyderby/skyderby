class AddRecordedAtToTracks < ActiveRecord::Migration
  def change
    add_column :tracks, :recorded_at, :datetime

    Track.all.each do |track|
      track.update_columns(recorded_at: track.points.last.gps_time)
    end
  end
end
