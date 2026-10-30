require 'test_helper'

class Api::V1::GooglePlay::NotificationsControllerTest < ActionDispatch::IntegrationTest
  include GoogleIdTokenHelper
  include GooglePlayHelper

  PUSH_AUDIENCE = 'https://skyderby.io/api/v1/google_play/notifications'.freeze
  PUSH_ACCOUNT = 'play-push@skyderby.iam.gserviceaccount.com'.freeze
  MONTHLY = 'io.skyderby.pro.monthly'.freeze

  setup do
    stub_google_jwks
    @user = users(:regular_user)
    @purchase = GooglePlayPurchase.create!(user: @user, purchase_token: 'token-1', product_id: MONTHLY,
                                           state: 'active', purchased_at: 40.days.ago, expires_at: 10.days.ago,
                                           acknowledged_at: 40.days.ago)
  end

  test 'a renewal extends the purchase' do
    body = google_play_subscription(acknowledgementState: 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED')
    stub_google_play_subscription('token-1', body)

    post_notification({ subscriptionNotification: { notificationType: 2, purchaseToken: 'token-1',
                                                    subscriptionId: MONTHLY } })

    assert_response :no_content
    assert_equal Time.zone.parse(body[:lineItems].first[:expiryTime]), @purchase.reload.expires_at
    assert_predicate @user.reload, :subscribed?
  end

  test 'an upgrade with a linked token is attributed to the owner of the old purchase' do
    stub_google_play_subscription('token-2', google_play_subscription(
                                               linkedPurchaseToken: 'token-1',
                                               lineItems: [{ productId: 'io.skyderby.pro.annual',
                                                             expiryTime: 1.year.from_now.utc.iso8601 }]
                                             ))
    stub_google_play_subscription_acknowledge('io.skyderby.pro.annual', 'token-2')

    post_notification({ subscriptionNotification: { notificationType: 4, purchaseToken: 'token-2',
                                                    subscriptionId: 'io.skyderby.pro.annual' } })

    assert_response :no_content
    upgraded = GooglePlayPurchase.find_by!(purchase_token: 'token-2')
    assert_equal @user, upgraded.user
    assert_equal 'io.skyderby.pro.annual', upgraded.product_id
    assert_equal 'token-1', upgraded.linked_purchase_token
  end

  test 'a purchase from an unknown user is skipped' do
    stub_google_play_subscription('token-9')

    assert_no_difference -> { GooglePlayPurchase.count } do
      post_notification({ subscriptionNotification: { notificationType: 4, purchaseToken: 'token-9',
                                                      subscriptionId: MONTHLY } })
    end

    assert_response :no_content
  end

  test 'a voided purchase is revoked' do
    @purchase.update!(expires_at: 20.days.from_now)

    post_notification({ voidedPurchaseNotification: { purchaseToken: 'token-1', orderId: 'GPA.1', productType: 1 } })

    assert_response :no_content
    assert_predicate @purchase.reload.revoked_at, :present?
    assert_not @user.reload.subscribed?
  end

  test 'a notification for another package is ignored' do
    post_notification({ voidedPurchaseNotification: { purchaseToken: 'token-1' } }, package_name: 'com.example.other')

    assert_response :no_content
    assert_nil @purchase.reload.revoked_at
  end

  test 'a test notification is accepted' do
    post_notification({ testNotification: { version: '1.0' } })

    assert_response :no_content
  end

  test 'Google Play outages ask Pub/Sub to retry' do
    stub_google_play_subscription('token-1', {}, status: 500)

    post_notification({ subscriptionNotification: { notificationType: 2, purchaseToken: 'token-1',
                                                    subscriptionId: MONTHLY } })

    assert_response :service_unavailable
  end

  test 'rejects a push token from another service account' do
    post_notification({ testNotification: {} }, push_token: google_id_token(aud: PUSH_AUDIENCE, email: 'x@example.com'))

    assert_response :unauthorized
  end

  test 'rejects a push token for another audience' do
    post_notification({ testNotification: {} }, push_token: google_id_token(aud: 'https://other', email: PUSH_ACCOUNT))

    assert_response :unauthorized
  end

  test 'rejects a push without a token' do
    post_notification({ testNotification: {} }, push_token: nil)

    assert_response :unauthorized
  end

  private

  def post_notification(event, package_name: GooglePlayPurchase::PACKAGE_NAME,
                        push_token: google_id_token(aud: PUSH_AUDIENCE, email: PUSH_ACCOUNT))
    data = { version: '1.0', packageName: package_name, eventTimeMillis: (Time.current.to_f * 1000).to_i.to_s }
           .merge(event)
    headers = push_token ? { 'Authorization' => "Bearer #{push_token}" } : {}

    GooglePlayPurchase::PushAuthorization.stub(:audience, PUSH_AUDIENCE) do
      GooglePlayPurchase::PushAuthorization.stub(:service_account, PUSH_ACCOUNT) do
        with_google_play_access do
          post api_v1_google_play_notifications_path,
               params: { message: { data: Base64.strict_encode64(data.to_json), messageId: '1' },
                         subscription: 'projects/skyderby/subscriptions/play' },
               headers:, as: :json
        end
      end
    end
  end
end
