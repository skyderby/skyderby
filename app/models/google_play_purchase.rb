class GooglePlayPurchase < ApplicationRecord
  class InvalidError < StandardError; end

  PACKAGE_NAME = 'io.skyderby.android'.freeze
  LIFETIME_PRODUCT_ID = 'io.skyderby.pro.lifetime'.freeze
  SUBSCRIPTION_PRODUCT_IDS = %w[io.skyderby.pro.monthly io.skyderby.pro.annual].freeze
  PRODUCT_IDS = [*SUBSCRIPTION_PRODUCT_IDS, LIFETIME_PRODUCT_ID].freeze
  ENTITLING_STATES = %w[active grace_period canceled purchased].freeze

  belongs_to :user

  validates :purchase_token, presence: true, uniqueness: true
  validates :state, :purchased_at, presence: true
  validates :product_id, inclusion: { in: PRODUCT_IDS }

  scope :active, lambda {
    where(revoked_at: nil, state: ENTITLING_STATES)
      .where('google_play_purchases.expires_at IS NULL OR google_play_purchases.expires_at > ?', Time.current)
  }

  scope :entitling, -> { active.where(test_purchase: false) }

  after_commit :update_subscribed_status, on: %i[create update destroy]

  def self.subscription?(product_id) = SUBSCRIPTION_PRODUCT_IDS.include?(product_id)

  def self.record!(verification, user: nil)
    purchase = find_or_initialize_by(purchase_token: verification.purchase_token)
    user ||= purchase.user || linked_user(verification.linked_purchase_token)
    return if user.nil?

    purchase.assign_attributes(verification.purchase_attributes.merge(user:))
    purchase.save!
    verification.acknowledge! if purchase.active?
    purchase.update!(acknowledged_at: Time.current) if purchase.acknowledged_at.nil? && verification.acknowledged?
    purchase
  end

  def self.linked_user(token)
    find_by(purchase_token: token)&.user if token.present?
  end

  def lifetime? = product_id == LIFETIME_PRODUCT_ID

  def active? = revoked_at.nil? && ENTITLING_STATES.include?(state) && (expires_at.nil? || expires_at.future?)

  def status
    return 'revoked' if revoked_at
    return 'lifetime' if lifetime? && active?

    active? ? 'active' : 'expired'
  end

  def environment = test_purchase? ? 'Test' : 'Production'

  private

  def update_subscribed_status
    affected_user_ids = [user_id, *previous_changes['user_id']].compact.uniq
    User.where(id: affected_user_ids).find_each do |affected_user|
      affected_user.update!(subscribed: affected_user.subscription_active?)
    end
  end
end
