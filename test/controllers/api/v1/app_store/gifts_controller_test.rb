require 'test_helper'

class Api::V1::AppStore::GiftsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper
  include AppStoreJwsHelper

  GIFT = AppStorePurchase::GIFT_PRODUCT_ID

  setup { use_test_app_store_root }
  teardown { restore_app_store_root }

  test '#create gifts lifetime Pro to the recipient without giving Pro to the buyer' do
    post_gift(app_store_transaction_payload(productId: GIFT, expiresDate: nil), message: '  Happy   birthday! ')

    assert_response :success
    gift = GiftedSubscription.sole
    assert_equal users(:event_responsible), gift.user
    assert_equal users(:regular_user), gift.granted_by
    assert_nil gift.expires_at
    assert_equal 'Happy birthday!', gift.reason
    assert_equal users(:regular_user), gift.app_store_purchase.user
    assert_predicate users(:event_responsible).subscription, :lifetime?
    assert_not users(:regular_user).reload.subscription_active?
    assert_includes users(:regular_user).sent_gifts, gift
  end

  test '#create refuses other products' do
    post_gift(app_store_transaction_payload(productId: 'io.skyderby.pro.lifetime', expiresDate: nil))

    assert_response :unprocessable_content
    assert_empty GiftedSubscription.all
  end

  test '#create refuses sandbox gifts from regular users' do
    post_gift(app_store_transaction_payload(productId: GIFT, expiresDate: nil, environment: 'Sandbox'))

    assert_response :unprocessable_content
  end

  test 'a refund ends the gift' do
    post_gift(app_store_transaction_payload(productId: GIFT, expiresDate: nil))
    gift = GiftedSubscription.sole

    gift.app_store_purchase.update!(revoked_at: Time.current)

    assert_not gift.reload.active?
  end

  private

  def post_gift(payload, message: nil)
    post api_v1_app_store_gifts_path,
         params: {
           signedTransaction: sign_app_store_payload(payload),
           recipientProfileId: profiles(:event_responsible).id,
           message:
         },
         headers: bearer(:regular_user_write),
         as: :json
  end
end
