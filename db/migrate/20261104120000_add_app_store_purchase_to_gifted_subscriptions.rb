class AddAppStorePurchaseToGiftedSubscriptions < ActiveRecord::Migration[8.1]
  def change
    add_reference :gifted_subscriptions, :app_store_purchase, foreign_key: true, index: { unique: true }
  end
end
