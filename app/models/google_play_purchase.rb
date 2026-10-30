class GooglePlayPurchase < ApplicationRecord
  class InvalidError < StandardError; end

  PACKAGE_NAME = 'io.skyderby.android'.freeze
  LIFETIME_PRODUCT_ID = 'io.skyderby.pro.lifetime'.freeze
  SUBSCRIPTION_PRODUCT_IDS = %w[io.skyderby.pro.monthly io.skyderby.pro.annual].freeze
  PRODUCT_IDS = [*SUBSCRIPTION_PRODUCT_IDS, LIFETIME_PRODUCT_ID].freeze
  ENTITLING_STATES = %w[active grace_period canceled purchased].freeze
  PENDING_STATES = %w[pending pending_canceled].freeze
  REPLACED = 'replaced'.freeze

  belongs_to :user

  validates :purchase_token, presence: true, uniqueness: true
  validates :state, :purchased_at, presence: true
  validates :product_id, inclusion: { in: PRODUCT_IDS }

  scope :active, lambda {
    where(revoked_at: nil, state: ENTITLING_STATES)
      .where('google_play_purchases.expires_at > :now OR ' \
             '(google_play_purchases.expires_at IS NULL AND google_play_purchases.product_id = :lifetime)',
             now: Time.current, lifetime: LIFETIME_PRODUCT_ID)
  }

  scope :entitling, -> { active.where(test_purchase: false) }

  after_commit :update_subscribed_status, on: %i[create update destroy]

  def self.subscription?(product_id) = SUBSCRIPTION_PRODUCT_IDS.include?(product_id)

  def self.record!(verification, user: nil)
    purchase = store!(verification, user:)
    acknowledge!(purchase, verification) if purchase&.active?
    purchase
  end

  def self.store!(verification, user:)
    upsert!(verification, user:)
  rescue ActiveRecord::RecordNotUnique
    upsert!(verification, user:)
  end

  def self.upsert!(verification, user:)
    transaction(requires_new: true) do
      purchase = find_or_initialize_by(purchase_token: verification.purchase_token)
      owner = user || purchase.user || linked_user(verification.linked_purchase_token)
      next if owner.nil?

      purchase.apply!(verification, user: owner)
      replace!(verification.linked_purchase_token) unless purchase.pending?
      purchase
    end
  end

  def self.acknowledge!(purchase, verification)
    purchase.update!(acknowledged_at: Time.current) if verification.acknowledge!
  rescue GooglePlayPurchase::Publisher::UnavailableError => e
    Rails.logger.warn("Google Play acknowledgement of #{purchase.purchase_token} postponed: #{e.message}")
  end

  def self.linked_user(token)
    find_by(purchase_token: token)&.user if token.present?
  end

  def self.replace!(token)
    where(purchase_token: token).where.not(state: REPLACED).find_each { it.update!(state: REPLACED) } if token.present?
  end

  private_class_method :store!, :upsert!, :acknowledge!, :linked_user, :replace!

  def apply!(verification, user:)
    assign_attributes(verification.purchase_attributes.merge(user:))
    self.state = REPLACED if replaced_by_linked_purchase?
    self.acknowledged_at ||= Time.current if verification.acknowledged?
    save!
  end

  def lifetime? = product_id == LIFETIME_PRODUCT_ID

  def pending? = PENDING_STATES.include?(state)

  def active? = revoked_at.nil? && ENTITLING_STATES.include?(state) && unexpired?

  def unexpired? = expires_at.nil? ? lifetime? : expires_at.future?

  def status
    return 'revoked' if revoked_at
    return 'lifetime' if lifetime? && active?

    active? ? 'active' : 'expired'
  end

  def environment = test_purchase? ? 'Test' : 'Production'

  private

  def replaced_by_linked_purchase?
    self.class.where(linked_purchase_token: purchase_token).where.not(state: PENDING_STATES).exists?
  end

  def update_subscribed_status
    affected_user_ids = [user_id, *previous_changes['user_id']].compact.uniq
    User.where(id: affected_user_ids).find_each do |affected_user|
      affected_user.update!(subscribed: affected_user.subscription_active?)
    end
  end
end
