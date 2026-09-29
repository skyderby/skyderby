require 'test_helper'

class Api::V1::AppStore::NotificationsControllerTest < ActionDispatch::IntegrationTest
  include AppStoreJwsHelper

  setup do
    use_test_app_store_root
    @user = users(:regular_user)
    @purchase = AppStorePurchase.create!(
      user: @user, original_transaction_id: '2000000000000001', transaction_id: '2000000000000001',
      product_id: 'io.skyderby.pro.monthly', environment: 'Sandbox',
      purchased_at: 40.days.ago, expires_at: 10.days.ago
    )
  end

  teardown { restore_app_store_root }

  test 'DID_RENEW extends purchase' do
    transaction = app_store_transaction_payload(transactionId: '2000000000000009')

    post_notification('DID_RENEW', transaction)

    assert_response :success
    assert_equal '2000000000000009', @purchase.reload.transaction_id
    assert_equal Time.zone.at(transaction[:expiresDate] / 1000), @purchase.expires_at
    assert_predicate @user.reload, :subscription_active?
    assert_predicate @user, :subscribed?
  end

  test 'REFUND revokes purchase' do
    @purchase.update!(transaction_id: '2000000000000002', purchased_at: 1.day.ago, expires_at: 29.days.from_now)

    post_notification('REFUND', app_store_transaction_payload(revocationDate: Time.current.to_i * 1000))

    assert_response :success
    assert_predicate @purchase.reload.revoked_at, :present?
    assert_not @user.reload.subscription_active?
    assert_not @user.subscribed?
  end

  test 'ignores outdated transactions' do
    @purchase.update!(transaction_id: '2000000000000005', purchased_at: 1.hour.ago, expires_at: 30.days.from_now)

    post_notification('DID_RENEW', app_store_transaction_payload(purchaseDate: 2.days.ago.to_i * 1000))

    assert_response :success
    assert_equal '2000000000000005', @purchase.reload.transaction_id
  end

  test 'ignores transactions of unknown purchases' do
    post_notification('SUBSCRIBED', app_store_transaction_payload(originalTransactionId: '999'))

    assert_response :success
    assert_nil AppStorePurchase.find_by(original_transaction_id: '999')
  end

  test 'accepts notifications without transaction info' do
    payload = { notificationType: 'TEST', data: { bundleId: 'io.skyderby.app', environment: 'Sandbox' } }

    post api_v1_app_store_notifications_path, params: { signedPayload: sign_app_store_payload(payload) }, as: :json

    assert_response :success
  end

  test 'rejects notifications for other bundle' do
    payload = { notificationType: 'TEST', data: { bundleId: 'com.example.other' } }

    post api_v1_app_store_notifications_path, params: { signedPayload: sign_app_store_payload(payload) }, as: :json

    assert_response :unprocessable_content
  end

  test 'rejects unsigned payload' do
    post api_v1_app_store_notifications_path, params: { signedPayload: 'a.b.c' }, as: :json

    assert_response :unprocessable_content
  end

  private

  def post_notification(type, transaction)
    payload = {
      notificationType: type,
      data: {
        bundleId: 'io.skyderby.app',
        environment: 'Sandbox',
        signedTransactionInfo: sign_app_store_payload(transaction)
      }
    }

    post api_v1_app_store_notifications_path, params: { signedPayload: sign_app_store_payload(payload) }, as: :json
  end
end
