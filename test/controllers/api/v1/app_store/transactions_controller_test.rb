require 'test_helper'

class Api::V1::AppStore::TransactionsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper
  include AppStoreJwsHelper

  setup { use_test_app_store_root }
  teardown { restore_app_store_root }

  test '#create records verified purchase and returns subscription' do
    payload = app_store_transaction_payload

    post api_v1_app_store_transactions_path,
         params: { signedTransaction: sign_app_store_payload(payload) },
         headers: bearer(:regular_user_write),
         as: :json

    assert_response :success
    purchase = AppStorePurchase.find_by!(original_transaction_id: '2000000000000001')
    assert_equal users(:regular_user), purchase.user
    assert_equal 'io.skyderby.pro.monthly', purchase.product_id
    assert_equal 'Sandbox', purchase.environment
    assert_equal Time.zone.at(payload[:expiresDate] / 1000), purchase.expires_at
    assert_predicate users(:regular_user).reload, :subscribed?
    assert_equal(
      { 'active' => true, 'source' => 'app_store', 'expiresAt' => purchase.expires_at.iso8601 },
      response.parsed_body['subscription']
    )
  end

  test '#create records lifetime purchase without expiry' do
    payload = app_store_transaction_payload(productId: 'io.skyderby.pro.lifetime', expiresDate: nil)

    post api_v1_app_store_transactions_path,
         params: { signedTransaction: sign_app_store_payload(payload) },
         headers: bearer(:regular_user_write),
         as: :json

    assert_response :success
    assert_equal({ 'active' => true, 'source' => 'app_store', 'expiresAt' => nil },
                 response.parsed_body['subscription'])
  end

  test '#create moves restored purchase to current user' do
    AppStorePurchase.create!(
      user: users(:event_responsible), original_transaction_id: '2000000000000001', transaction_id: '1',
      product_id: 'io.skyderby.pro.monthly', environment: 'Sandbox', purchased_at: 2.months.ago,
      expires_at: 1.month.ago
    )

    post api_v1_app_store_transactions_path,
         params: { signedTransaction: sign_app_store_payload(app_store_transaction_payload) },
         headers: bearer(:regular_user_write),
         as: :json

    assert_response :success
    assert_equal users(:regular_user), AppStorePurchase.sole.user
  end

  test '#create rejects other bundle id' do
    payload = app_store_transaction_payload(bundleId: 'com.example.other')

    post api_v1_app_store_transactions_path,
         params: { signedTransaction: sign_app_store_payload(payload) },
         headers: bearer(:regular_user_write),
         as: :json

    assert_response :unprocessable_content
    assert_equal ['Unexpected bundle id'], response.parsed_body['errors']
    assert_equal 0, AppStorePurchase.count
  end

  test '#create rejects untrusted certificate chain' do
    restore_app_store_root
    use_test_app_store_root(OpenSSL::X509::Certificate.new(Rails.root.join('config/certs/AppleRootCA-G3.cer').binread))

    post api_v1_app_store_transactions_path,
         params: { signedTransaction: sign_app_store_payload(app_store_transaction_payload) },
         headers: bearer(:regular_user_write),
         as: :json

    assert_response :unprocessable_content
    assert_equal ['Untrusted root certificate'], response.parsed_body['errors']
  end

  test '#create rejects tampered payload' do
    header, _payload, signature = sign_app_store_payload(app_store_transaction_payload).split('.')
    forged = Base64.urlsafe_encode64(app_store_transaction_payload(expiresDate: 10.years.from_now.to_i * 1000).to_json,
                                     padding: false)

    post api_v1_app_store_transactions_path,
         params: { signedTransaction: [header, forged, signature].join('.') },
         headers: bearer(:regular_user_write),
         as: :json

    assert_response :unprocessable_content
    assert_equal ['Invalid signature'], response.parsed_body['errors']
  end

  test '#create requires authentication' do
    post api_v1_app_store_transactions_path,
         params: { signedTransaction: sign_app_store_payload(app_store_transaction_payload) },
         as: :json

    assert_response :unauthorized
  end

  test '#create requires signed transaction' do
    post api_v1_app_store_transactions_path, params: {}, headers: bearer(:regular_user_write), as: :json

    assert_response :bad_request
  end

  test '#create is forbidden while impersonating' do
    impersonation = Impersonation.start!(admin: users(:admin), user: users(:regular_user),
                                         application: oauth_applications(:skyderby_apple))

    assert_no_difference -> { AppStorePurchase.count } do
      post api_v1_app_store_transactions_path,
           params: { signedTransaction: sign_app_store_payload(app_store_transaction_payload) },
           headers: { 'Authorization' => "Bearer #{impersonation.access_token.token}" },
           as: :json
    end

    assert_response :forbidden
  end
end
