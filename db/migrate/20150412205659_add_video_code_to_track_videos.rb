class AddVideoCodeToTrackVideos < ActiveRecord::Migration
  def change
    add_column :track_videos, :video_code, :string
  end
end
