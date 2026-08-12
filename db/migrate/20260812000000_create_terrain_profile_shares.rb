class CreateTerrainProfileShares < ActiveRecord::Migration[8.1]
  def change
    create_table :terrain_profile_shares do |t|
      t.bigint :terrain_profile_id, null: false
      t.bigint :user_id, null: false
      t.timestamps

      t.index [:terrain_profile_id, :user_id], unique: true
      t.index :user_id
    end
  end
end
