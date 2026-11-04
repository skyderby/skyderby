class GiftedSubscription < ApplicationRecord
  belongs_to :user
  belongs_to :granted_by, class_name: 'User', optional: true
  belongs_to :google_play_purchase, optional: true
  belongs_to :app_store_purchase, optional: true

  MESSAGE_LENGTH = 200

  scope :active, -> { where('expires_at IS NULL OR expires_at > ?', Time.current) }

  after_destroy :update_user_subscribed_status
  after_save :update_user_subscribed_status

  def self.purchase_from_google_play!(verification, buyer:, recipient:, message: nil)
    gift_product = verification.product_id == GooglePlayPurchase::GIFT_PRODUCT_ID
    raise GooglePlayPurchase::InvalidError, 'Not a gift' unless gift_product

    ensure_unclaimed!(verification.purchase_token, buyer)
    purchase = GooglePlayPurchase.record!(verification, user: buyer)
    ensure_giftable!(purchase, buyer)

    gift = find_by(google_play_purchase: purchase) ||
           create_from_google_play!(purchase, buyer:, recipient:, message:)
    purchase.consume!
    gift
  end

  def self.purchase_from_app_store!(transaction, buyer:, recipient:, message: nil)
    invalid = AppStorePurchase::SignedPayload::InvalidError
    raise invalid, 'Not a gift' unless transaction.attributes['productId'] == AppStorePurchase::GIFT_PRODUCT_ID

    ensure_app_store_unclaimed!(transaction, buyer)
    purchase = AppStorePurchase.record!(transaction, user: buyer)
    ensure_app_store_giftable!(purchase, buyer)
    find_by(app_store_purchase: purchase) || create_from_app_store!(purchase, buyer:, recipient:, message:)
  end

  def self.create_from_app_store!(purchase, buyer:, recipient:, message:)
    create!(app_store_purchase: purchase, user: recipient, granted_by: buyer,
            reason: message.to_s.squish.truncate(MESSAGE_LENGTH).presence)
  rescue ActiveRecord::RecordNotUnique
    find_by!(app_store_purchase: purchase)
  end

  def self.ensure_app_store_unclaimed!(transaction, buyer)
    owner_id = AppStorePurchase.where(original_transaction_id: transaction.original_transaction_id).pick(:user_id)
    return if owner_id.nil? || owner_id == buyer.id

    raise AppStorePurchase::SignedPayload::InvalidError, 'This purchase belongs to another account'
  end

  def self.ensure_app_store_giftable!(purchase, buyer)
    raise AppStorePurchase::SignedPayload::InvalidError, 'The gift is not paid' unless purchase&.paid_gift?
    return unless purchase.test_purchase? && !buyer.admin?

    raise AppStorePurchase::SignedPayload::InvalidError, 'Test purchases cannot be gifted'
  end

  def self.create_from_google_play!(purchase, buyer:, recipient:, message:)
    create!(google_play_purchase: purchase, user: recipient, granted_by: buyer,
            reason: message.to_s.squish.truncate(MESSAGE_LENGTH).presence)
  rescue ActiveRecord::RecordNotUnique
    find_by!(google_play_purchase: purchase)
  end

  def self.ensure_unclaimed!(purchase_token, buyer)
    owner_id = GooglePlayPurchase.where(purchase_token:).pick(:user_id)
    return if owner_id.nil? || owner_id == buyer.id

    raise GooglePlayPurchase::InvalidError, 'This purchase belongs to another account'
  end

  def self.ensure_giftable!(purchase, buyer)
    raise GooglePlayPurchase::InvalidError, 'The gift is not paid' unless purchase&.paid_gift?
    return unless purchase.test_purchase? && !buyer.admin?

    raise GooglePlayPurchase::InvalidError, 'Test purchases cannot be gifted'
  end

  private_class_method :create_from_google_play!, :ensure_unclaimed!, :ensure_giftable!,
                       :create_from_app_store!, :ensure_app_store_unclaimed!, :ensure_app_store_giftable!

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
