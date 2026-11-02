class AddGooglePlayPurchaseToGiftedSubscriptions < ActiveRecord::Migration[8.1]
  def change
    add_reference :gifted_subscriptions, :google_play_purchase, foreign_key: true, index: { unique: true }
  end
end
