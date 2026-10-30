class GooglePlayPurchase::Verification
  SUBSCRIPTION_STATES = {
    'SUBSCRIPTION_STATE_ACTIVE' => 'active',
    'SUBSCRIPTION_STATE_IN_GRACE_PERIOD' => 'grace_period',
    'SUBSCRIPTION_STATE_CANCELED' => 'canceled',
    'SUBSCRIPTION_STATE_ON_HOLD' => 'on_hold',
    'SUBSCRIPTION_STATE_PAUSED' => 'paused',
    'SUBSCRIPTION_STATE_EXPIRED' => 'expired',
    'SUBSCRIPTION_STATE_PENDING' => 'pending',
    'SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED' => 'pending_canceled'
  }.freeze
  PRODUCT_STATES = { 0 => 'purchased', 1 => 'voided', 2 => 'pending' }.freeze
  ACKNOWLEDGED = 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED'.freeze

  attr_reader :purchase_token, :product_id

  def self.fetch(product_id:, purchase_token:)
    raise GooglePlayPurchase::InvalidError, 'Purchase token is missing' if purchase_token.blank?
    raise GooglePlayPurchase::InvalidError, 'Unknown product' if GooglePlayPurchase::PRODUCT_IDS.exclude?(product_id)

    if GooglePlayPurchase.subscription?(product_id)
      new(product_id:, purchase_token:, subscription: GooglePlayPurchase::Publisher.subscription(purchase_token))
    else
      new(product_id:, purchase_token:, product: GooglePlayPurchase::Publisher.product(product_id, purchase_token))
    end
  end

  def initialize(product_id:, purchase_token:, subscription: nil, product: nil)
    @purchase_token = purchase_token
    @subscription = subscription
    @product = product
    @product_id = subscription ? subscription_product_id(product_id) : product_id
  end

  def subscription? = subscription.present?

  def linked_purchase_token = subscription&.dig('linkedPurchaseToken')

  def acknowledged?
    return true if @acknowledged
    return subscription['acknowledgementState'] == ACKNOWLEDGED if subscription?

    product['acknowledgementState'].to_i == 1
  end

  def acknowledge!
    return if acknowledged?

    if subscription?
      GooglePlayPurchase::Publisher.acknowledge_subscription(product_id, purchase_token)
    else
      GooglePlayPurchase::Publisher.acknowledge_product(product_id, purchase_token)
    end
    @acknowledged = true
  end

  def purchase_attributes
    {
      product_id:,
      linked_purchase_token:,
      order_id: subscription ? subscription['latestOrderId'] : product['orderId'],
      state:,
      test_purchase: test_purchase?,
      purchased_at:,
      expires_at:,
      acknowledged_at: (Time.current if acknowledged?)
    }.compact.merge(expires_at:)
  end

  private

  attr_reader :subscription, :product

  def subscription_product_id(fallback)
    ids = line_items.pluck('productId').compact
    ids.include?(fallback) ? fallback : ids.first || fallback
  end

  def line_items = Array(subscription&.dig('lineItems'))

  def state
    return SUBSCRIPTION_STATES.fetch(subscription['subscriptionState'], 'unknown') if subscription?

    PRODUCT_STATES.fetch(product['purchaseState'].to_i, 'unknown')
  end

  def test_purchase?
    return subscription.key?('testPurchase') if subscription?

    product.key?('purchaseType') && product['purchaseType'].to_i.zero?
  end

  def purchased_at
    return parse_time(subscription['startTime']) || Time.current if subscription?

    millis = product['purchaseTimeMillis']
    millis.present? ? Time.zone.at(millis.to_i / 1000.0) : Time.current
  end

  def expires_at
    return unless subscription?

    line_items.filter_map { parse_time(it['expiryTime']) }.max
  end

  def parse_time(value) = value.present? ? Time.zone.parse(value) : nil
end
