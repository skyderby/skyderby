class AppStorePurchase::Notification
  def initialize(signed_payload)
    @payload = AppStorePurchase::SignedPayload.new(signed_payload).payload
  end

  def notification_type = payload['notificationType']

  def process
    data = payload['data']
    return if data.blank?
    raise AppStorePurchase::SignedPayload::InvalidError, 'Unexpected bundle id' unless bundle_id_matches?(data)
    return if data['signedTransactionInfo'].blank?

    AppStorePurchase.record!(AppStorePurchase::Transaction.from_jws(data['signedTransactionInfo']))
  end

  private

  attr_reader :payload

  def bundle_id_matches?(data) = data['bundleId'] == AppStorePurchase::BUNDLE_ID
end
