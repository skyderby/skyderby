class CreateJumps < ActiveRecord::Migration[8.1]
  def change # rubocop:disable Metrics/AbcSize
    create_table :jumps do |t| # rubocop:disable Metrics/BlockLength
      t.integer :profile_id, null: false
      t.uuid :client_uuid, null: false, default: -> { 'gen_random_uuid()' }
      t.integer :track_id
      t.integer :kind, null: false, default: 0
      t.integer :number
      t.timestamptz :jumped_at, null: false
      t.integer :place_id
      t.string :place_name
      t.integer :suit_id
      t.string :jump_type
      t.string :aircraft
      t.string :equipment
      t.integer :object_type
      t.integer :wind_strength
      t.integer :wind_direction
      t.integer :exit_altitude
      t.integer :deployment_altitude
      t.integer :freefall_seconds
      t.integer :canopy_seconds
      t.string :shared_with
      t.text :notes
      t.timestamptz :deleted_at
      t.timestamps

      t.index %i[profile_id client_uuid], unique: true
      t.index %i[profile_id kind jumped_at]
      t.index :track_id, unique: true, where: 'track_id IS NOT NULL AND deleted_at IS NULL'
      t.index :place_id
      t.index :suit_id
    end
  end
end
