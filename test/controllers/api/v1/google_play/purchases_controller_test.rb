require 'test_helper'

class Api::V1::GooglePlay::PurchasesControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper
  include GooglePlayHelper

  MONTHLY = 'io.skyderby.pro.monthly'.freeze
  LIFETIME = 'io.skyderby.pro.lifetime'.freeze

  test '#create records a verified subscription, acknowledges it and returns the subscription' do
    body = google_play_subscription
    stub_google_play_subscription('token-1', body)
    acknowledge = stub_google_play_subscription_acknowledge(MONTHLY, 'token-1')

    post_purchase(product_id: MONTHLY, purchase_token: 'token-1')

    assert_response :success
    purchase = GooglePlayPurchase.find_by!(purchase_token: 'token-1')
    assert_equal users(:regular_user), purchase.user
    assert_equal MONTHLY, purchase.product_id
    assert_equal 'active', purchase.state
    assert_equal 'GPA.1234-5678-9012-34567', purchase.order_id
    assert_equal Time.zone.parse(body[:lineItems].first[:expiryTime]), purchase.expires_at
    assert_predicate purchase.acknowledged_at, :present?
    assert_requested acknowledge
    assert_predicate users(:regular_user).reload, :subscribed?
    assert_equal(
      { 'active' => true, 'source' => 'google_play', 'expiresAt' => purchase.expires_at.iso8601 },
      response.parsed_body['subscription']
    )
  end

  test '#create does not acknowledge an already acknowledged subscription' do
    stub_google_play_subscription('token-1',
                                  google_play_subscription(acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED'))
    acknowledge = stub_google_play_subscription_acknowledge(MONTHLY, 'token-1')

    post_purchase(product_id: MONTHLY, purchase_token: 'token-1')

    assert_response :success
    assert_not_requested acknowledge
  end

  test '#create records a test purchase without giving Pro' do
    stub_google_play_subscription('token-1', google_play_subscription(testPurchase: {}))
    stub_google_play_subscription_acknowledge(MONTHLY, 'token-1')

    post_purchase(product_id: MONTHLY, purchase_token: 'token-1')

    assert_response :success
    assert_predicate GooglePlayPurchase.sole, :test_purchase?
    assert_not users(:regular_user).reload.subscribed?
    assert_not response.parsed_body.dig('subscription', 'active')
  end

  test '#create records a pending subscription without giving Pro or acknowledging it' do
    stub_google_play_subscription('token-1', google_play_subscription(subscriptionState: 'SUBSCRIPTION_STATE_PENDING'))
    acknowledge = stub_google_play_subscription_acknowledge(MONTHLY, 'token-1')

    post_purchase(product_id: MONTHLY, purchase_token: 'token-1')

    assert_response :success
    assert_equal 'pending', GooglePlayPurchase.sole.state
    assert_not_requested acknowledge
    assert_not response.parsed_body.dig('subscription', 'active')
  end

  test '#create records a lifetime product without expiry' do
    stub_google_play_product(LIFETIME, 'token-2')
    acknowledge = stub_google_play_product_acknowledge(LIFETIME, 'token-2')

    post_purchase(product_id: LIFETIME, purchase_token: 'token-2')

    assert_response :success
    purchase = GooglePlayPurchase.sole
    assert_equal 'purchased', purchase.state
    assert_nil purchase.expires_at
    assert_requested acknowledge
    assert_equal({ 'active' => true, 'source' => 'google_play', 'expiresAt' => nil },
                 response.parsed_body['subscription'])
  end

  test '#create is idempotent for the same purchase token' do
    stub_google_play_subscription('token-1')
    stub_google_play_subscription_acknowledge(MONTHLY, 'token-1')

    assert_difference -> { GooglePlayPurchase.count } => 1 do
      2.times { post_purchase(product_id: MONTHLY, purchase_token: 'token-1') }
    end

    assert_response :success
  end

  test '#create moves a restored purchase to the current user' do
    GooglePlayPurchase.create!(user: users(:event_responsible), purchase_token: 'token-1', product_id: MONTHLY,
                               state: 'active', purchased_at: 1.day.ago, expires_at: 1.month.from_now)
    stub_google_play_subscription('token-1')
    stub_google_play_subscription_acknowledge(MONTHLY, 'token-1')

    post_purchase(product_id: MONTHLY, purchase_token: 'token-1')

    assert_response :success
    assert_equal users(:regular_user), GooglePlayPurchase.sole.user
  end

  test '#create rejects an unknown purchase token' do
    stub_google_play_subscription('bad', { error: { code: 400 } }, status: 400)

    post_purchase(product_id: MONTHLY, purchase_token: 'bad')

    assert_response :unprocessable_content
    assert_equal ['Unknown purchase token'], response.parsed_body['errors']
    assert_equal 0, GooglePlayPurchase.count
  end

  test '#create rejects an unknown product' do
    post_purchase(product_id: 'io.skyderby.coins', purchase_token: 'token-1')

    assert_response :unprocessable_content
    assert_equal ['Unknown product'], response.parsed_body['errors']
  end

  test '#create rejects another package' do
    post_purchase(product_id: MONTHLY, purchase_token: 'token-1', package_name: 'com.example.other')

    assert_response :unprocessable_content
    assert_equal ['Unexpected package name'], response.parsed_body['errors']
  end

  test '#create responds service unavailable when Google Play fails' do
    stub_google_play_subscription('token-1', {}, status: 503)

    post_purchase(product_id: MONTHLY, purchase_token: 'token-1')

    assert_response :service_unavailable
  end

  test '#create requires authentication' do
    post api_v1_google_play_purchases_path, params: { product_id: MONTHLY, purchase_token: 'token-1' }, as: :json

    assert_response :unauthorized
  end

  test '#create requires a purchase token' do
    post_purchase(product_id: MONTHLY)

    assert_response :bad_request
  end

  private

  def post_purchase(**params)
    with_google_play_access do
      post api_v1_google_play_purchases_path,
           params: { package_name: GooglePlayPurchase::PACKAGE_NAME }.merge(params),
           headers: bearer(:regular_user_write),
           as: :json
    end
  end
end
