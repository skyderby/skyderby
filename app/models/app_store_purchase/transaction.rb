class AppStorePurchase::Transaction
  attr_reader :attributes

  def self.from_jws(jws)
    new(AppStorePurchase::SignedPayload.new(jws).payload)
  end

  def initialize(attributes)
    @attributes = attributes
    return if attributes['bundleId'] == AppStorePurchase::BUNDLE_ID

    raise AppStorePurchase::SignedPayload::InvalidError, 'Unexpected bundle id'
  end

  def original_transaction_id = attributes['originalTransactionId'].to_s

  def transaction_id = attributes['transactionId'].to_s

  def purchased_at = timestamp('purchaseDate')

  def revoked_at = timestamp('revocationDate')

  def purchase_attributes
    {
      transaction_id:,
      product_id: attributes['productId'],
      environment: attributes['environment'],
      purchased_at:,
      expires_at: timestamp('expiresDate'),
      revoked_at:
    }
  end

  private

  def timestamp(key)
    value = attributes[key]
    Time.zone.at(value.to_i / 1000.0) if value.present?
  end
end
