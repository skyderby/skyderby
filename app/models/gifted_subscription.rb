class GiftedSubscription < ApplicationRecord
  belongs_to :user
  belongs_to :granted_by, class_name: 'User', optional: true
  belongs_to :google_play_purchase, optional: true

  MESSAGE_LENGTH = 200

  scope :active, -> { where('expires_at IS NULL OR expires_at > ?', Time.current) }

  after_destroy :update_user_subscribed_status
  after_save :update_user_subscribed_status

  def self.purchase_from_google_play!(verification, buyer:, recipient:, message: nil)
    gift_product = verification.product_id == GooglePlayPurchase::GIFT_PRODUCT_ID
    raise GooglePlayPurchase::InvalidError, 'Not a gift' unless gift_product

    purchase = GooglePlayPurchase.record!(verification, user: buyer)
    ensure_giftable!(purchase, buyer)

    find_by(google_play_purchase: purchase) ||
      create!(google_play_purchase: purchase, user: recipient, granted_by: buyer,
              reason: message.to_s.squish.truncate(MESSAGE_LENGTH).presence)
  rescue ActiveRecord::RecordNotUnique
    find_by!(google_play_purchase: purchase)
  end

  def self.ensure_giftable!(purchase, buyer)
    raise GooglePlayPurchase::InvalidError, 'The gift is not paid' unless purchase&.paid_gift?
    return unless purchase.test_purchase? && !buyer.admin?

    raise GooglePlayPurchase::InvalidError, 'Test purchases cannot be gifted'
  end

  private_class_method :ensure_giftable!

  def lifetime? = expires_at.nil?

  def active? = lifetime? || expires_at > Time.current

  def status
    return 'lifetime' if lifetime?
    return 'expired' if expires_at <= Time.current

    'active'
  end

  private

  def update_user_subscribed_status
    user.update!(subscribed: user.subscription_active?)
  end
end
