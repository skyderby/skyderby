class GooglePlayPurchase::Notification
  def initialize(message)
    parsed = JSON.parse(Base64.decode64(message.to_h.with_indifferent_access.fetch(:data, '').to_s))
    @data = parsed.is_a?(Hash) ? parsed : {}
  rescue JSON::ParserError
    @data = {}
  end

  def process
    return unless data['packageName'] == GooglePlayPurchase::PACKAGE_NAME

    if (notification = data['subscriptionNotification'])
      record(subscription_product_id(notification), notification['purchaseToken'])
    elsif (notification = data['oneTimeProductNotification'])
      record(notification['sku'], notification['purchaseToken'])
    elsif (notification = data['voidedPurchaseNotification'])
      GooglePlayPurchase.find_by(purchase_token: notification['purchaseToken'])&.update!(revoked_at: Time.current)
    end
  end

  private

  attr_reader :data

  def record(product_id, purchase_token)
    return unless GooglePlayPurchase.exists?(purchase_token:) || GooglePlayPurchase.subscription?(product_id)

    GooglePlayPurchase.record!(GooglePlayPurchase::Verification.fetch(product_id:, purchase_token:))
  rescue GooglePlayPurchase::InvalidError, ActiveRecord::RecordInvalid => e
    Rails.logger.warn("Google Play notification for #{purchase_token} skipped: #{e.message}")
  end

  def subscription_product_id(notification)
    product_id = notification['subscriptionId']
    return product_id if GooglePlayPurchase.subscription?(product_id)

    GooglePlayPurchase.find_by(purchase_token: notification['purchaseToken'])&.product_id ||
      GooglePlayPurchase::SUBSCRIPTION_PRODUCT_IDS.first
  end
end
