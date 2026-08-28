class CreateExitProfiles < ActiveRecord::Migration[8.1]
  def change
    create_table :track_exit_profiles do |t|
      t.bigint :track_id, null: false
      t.bigint :profile_id, null: false
      t.bigint :suit_id, null: false
      t.timestamptz :recorded_at, null: false
      t.jsonb :distances, null: false, default: []
      t.float :reference_distance, null: false
      t.timestamps

      t.index :track_id, unique: true
      t.index %i[profile_id suit_id recorded_at]
    end

    create_table :profile_exit_performances do |t|
      t.bigint :profile_id, null: false
      t.bigint :suit_id, null: false
      t.integer :tracks_count, null: false, default: 0
      t.jsonb :samples, null: false, default: []
      t.timestamptz :last_recorded_at
      t.timestamps

      t.index %i[profile_id suit_id], unique: true
    end
  end
end
