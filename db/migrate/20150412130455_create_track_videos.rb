class CreateTrackVideos < ActiveRecord::Migration
  def change
    create_table :track_videos do |t|
      t.references :track, index: true
      t.string :url
      t.decimal :video_offset, precision: 10, scale: 2
      t.decimal :track_offset, precision: 10, scale: 2

      t.timestamps
    end
  end
end
