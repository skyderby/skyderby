class CreateAppStorePurchases < ActiveRecord::Migration[8.1]
  def change
    create_table :app_store_purchases do |t|
      t.references :user, null: false, foreign_key: true, type: :integer
      t.string :original_transaction_id, null: false
      t.string :transaction_id, null: false
      t.string :product_id, null: false
      t.string :environment, null: false
      t.datetime :purchased_at, null: false
      t.datetime :expires_at
      t.datetime :revoked_at
      t.timestamps
    end

    add_index :app_store_purchases, :original_transaction_id, unique: true
  end
end
