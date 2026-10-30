class CreateGooglePlayPurchases < ActiveRecord::Migration[8.1]
  def change
    create_table :google_play_purchases do |t|
      t.references :user, null: false, foreign_key: true
      t.string :purchase_token, null: false, index: { unique: true }
      t.string :linked_purchase_token, index: true
      t.string :product_id, null: false
      t.string :order_id
      t.string :state, null: false
      t.boolean :test_purchase, null: false, default: false
      t.datetime :purchased_at, null: false
      t.datetime :expires_at
      t.datetime :revoked_at
      t.datetime :acknowledged_at
      t.timestamps
    end
  end
end
