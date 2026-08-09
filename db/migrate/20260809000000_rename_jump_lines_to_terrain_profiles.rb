class RenameJumpLinesToTerrainProfiles < ActiveRecord::Migration[8.1]
  def up
    rename_table :place_jump_lines, :terrain_profiles
    rename_table :place_jump_line_measurements, :terrain_profile_measurements
    rename_column :terrain_profile_measurements, :jump_line_id, :terrain_profile_id

    add_index :terrain_profile_measurements, :terrain_profile_id

    change_table :terrain_profiles, bulk: true do |t|
      t.bigint :user_id
      t.bigint :track_id
      t.datetime :published_at
      t.index :user_id
      t.index :track_id
    end

    execute 'UPDATE terrain_profiles SET published_at = created_at'

    execute <<~SQL.squish
      UPDATE terrain_profiles
      SET track_id = (
        SELECT tracks.id
        FROM tracks
        WHERE tracks.place_id = terrain_profiles.place_id
          AND tracks.kind = 1
          AND tracks.visibility = 0
        ORDER BY tracks.recorded_at DESC NULLS LAST
        LIMIT 1
      )
      WHERE terrain_profiles.place_id IS NOT NULL
    SQL
  end

  def down
    change_table :terrain_profiles, bulk: true do |t|
      t.remove :published_at
      t.remove :track_id
      t.remove :user_id
    end

    remove_index :terrain_profile_measurements, :terrain_profile_id

    rename_column :terrain_profile_measurements, :terrain_profile_id, :jump_line_id
    rename_table :terrain_profile_measurements, :place_jump_line_measurements
    rename_table :terrain_profiles, :place_jump_lines
  end
end
