class CreateUserIdentities < ActiveRecord::Migration[8.1]
  def up
    create_table :user_identities do |t|
      t.references :user, null: false, type: :integer, foreign_key: { on_delete: :cascade }
      t.string :provider, null: false
      t.string :uid, null: false
      t.string :email
      t.boolean :private_email, null: false, default: false
      t.string :apple_refresh_token
      t.timestamps
    end
    add_index :user_identities, %i[provider uid], unique: true

    execute <<~SQL.squish
      INSERT INTO user_identities (user_id, provider, uid, email, private_email, created_at, updated_at)
      SELECT id, provider, uid, email, email ILIKE '%@privaterelay.appleid.com', NOW(), NOW()
      FROM users
      WHERE provider IS NOT NULL AND provider <> '' AND uid IS NOT NULL AND uid <> ''
      ON CONFLICT (provider, uid) DO NOTHING
    SQL
  end

  def down
    drop_table :user_identities
  end
end
