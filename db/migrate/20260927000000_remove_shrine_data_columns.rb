class RemoveShrineDataColumns < ActiveRecord::Migration[8.1]
  def change
    remove_column :event_competitors, :photo_data, :jsonb
    remove_column :speed_skydiving_competition_competitors, :photo_data, :jsonb
    change_table :tournament_competitors, bulk: true do |t|
      t.remove :photo_data, type: :jsonb
      t.remove :sponsor_logo_data, type: :jsonb
    end
    remove_column :gps_recordings_archives, :file_data, :jsonb
    remove_column :place_photos, :image_data, :jsonb
    remove_column :profiles, :userpic_data, :jsonb
    remove_column :sponsors, :logo_data, :jsonb
    remove_column :track_files, :file_data, :jsonb
  end
end
