module GooglePlayHelper
  extend ActiveSupport::Concern
  include WebMock::API

  included do
    teardown { WebMock.reset! }
  end

  GOOGLE_PLAY_BASE_URL =
    "#{GooglePlayPurchase::Publisher::BASE_URL}/#{GooglePlayPurchase::PACKAGE_NAME}/purchases".freeze

  def with_google_play_access(&)
    GooglePlayPurchase::Publisher.stub(:access_token, 'play-access-token', &)
  end

  def google_play_subscription(**overrides)
    {
      kind: 'androidpublisher#subscriptionPurchaseV2',
      startTime: 1.day.ago.utc.iso8601,
      subscriptionState: 'SUBSCRIPTION_STATE_ACTIVE',
      latestOrderId: 'GPA.1234-5678-9012-34567',
      acknowledgementState: 'ACKNOWLEDGEMENT_STATE_PENDING',
      lineItems: [{ productId: 'io.skyderby.pro.monthly', expiryTime: 29.days.from_now.utc.iso8601 }]
    }.merge(overrides).compact
  end

  def google_play_product(**overrides)
    {
      kind: 'androidpublisher#productPurchase',
      purchaseTimeMillis: (1.day.ago.to_f * 1000).to_i.to_s,
      purchaseState: 0,
      acknowledgementState: 0,
      orderId: 'GPA.9999-0000-1111-22222'
    }.merge(overrides).compact
  end

  def stub_google_play_subscription(token, body = google_play_subscription, status: 200)
    stub_request(:get, "#{GOOGLE_PLAY_BASE_URL}/subscriptionsv2/tokens/#{token}")
      .with(headers: { 'Authorization' => 'Bearer play-access-token' })
      .to_return(status:, body: body.to_json, headers: { 'Content-Type' => 'application/json' })
  end

  def stub_google_play_product(product_id, token, body = google_play_product, status: 200)
    stub_request(:get, "#{GOOGLE_PLAY_BASE_URL}/products/#{product_id}/tokens/#{token}")
      .to_return(status:, body: body.to_json, headers: { 'Content-Type' => 'application/json' })
  end

  def stub_google_play_subscription_acknowledge(product_id, token)
    stub_request(:post, "#{GOOGLE_PLAY_BASE_URL}/subscriptions/#{product_id}/tokens/#{token}:acknowledge")
      .to_return(status: 204)
  end

  def stub_google_play_product_acknowledge(product_id, token)
    stub_request(:post, "#{GOOGLE_PLAY_BASE_URL}/products/#{product_id}/tokens/#{token}:acknowledge")
      .to_return(status: 204)
  end
end
