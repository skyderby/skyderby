class AppStorePurchase < ApplicationRecord
  BUNDLE_ID = 'io.skyderby.app'.freeze
  LIFETIME_PRODUCT_ID = 'io.skyderby.pro.lifetime'.freeze
  PRODUCT_IDS = %w[io.skyderby.pro.monthly io.skyderby.pro.annual io.skyderby.pro.lifetime].freeze

  belongs_to :user

  validates :original_transaction_id, presence: true, uniqueness: true
  validates :transaction_id, :environment, :purchased_at, presence: true
  validates :product_id, inclusion: { in: PRODUCT_IDS }

  scope :active, lambda {
    where(revoked_at: nil).where('app_store_purchases.expires_at IS NULL OR app_store_purchases.expires_at > ?',
                                 Time.current)
  }

  after_commit :update_subscribed_status, on: %i[create update destroy]

  def self.record!(transaction, user: nil)
    purchase = find_or_initialize_by(original_transaction_id: transaction.original_transaction_id)
    return if purchase.new_record? && user.nil?

    purchase.user = user if user
    purchase.assign_attributes(transaction.purchase_attributes) if purchase.supersedable_by?(transaction)
    purchase.save!
    purchase
  end

  def supersedable_by?(transaction)
    return true if new_record? || transaction.transaction_id == transaction_id

    transaction.purchased_at.present? && transaction.purchased_at >= purchased_at
  end

  def lifetime? = product_id == LIFETIME_PRODUCT_ID

  def active? = revoked_at.nil? && (expires_at.nil? || expires_at.future?)

  def status
    return 'revoked' if revoked_at
    return 'lifetime' if expires_at.nil?

    expires_at.future? ? 'active' : 'expired'
  end

  private

  def update_subscribed_status
    affected_user_ids = [user_id, *previous_changes['user_id']].compact.uniq
    User.where(id: affected_user_ids).find_each do |affected_user|
      affected_user.update!(subscribed: affected_user.subscription_active?)
    end
  end
end
