require 'test_helper'

class Api::V1::GooglePlay::GiftsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper
  include GooglePlayHelper

  GIFT = GooglePlayPurchase::GIFT_PRODUCT_ID

  test '#create gifts lifetime Pro to the recipient' do
    stub_google_play_product(GIFT, 'gift-1')

    post_gift(purchase_token: 'gift-1', message: '  Happy   birthday! ')

    assert_response :success
    gift = GiftedSubscription.sole
    assert_equal users(:event_responsible), gift.user
    assert_equal users(:regular_user), gift.granted_by
    assert_nil gift.expires_at
    assert_equal 'Happy birthday!', gift.reason
    assert_equal users(:regular_user), gift.google_play_purchase.user
    assert_predicate users(:event_responsible).subscription, :lifetime?
    assert_not users(:regular_user).reload.subscription_active?
    assert_equal profiles(:event_responsible).id, response.parsed_body.dig('gift', 'recipient', 'id')
  end

  test '#create consumes the gift purchase' do
    stub_google_play_product(GIFT, 'gift-1')

    post_gift(purchase_token: 'gift-1')

    assert_requested :post, "#{GOOGLE_PLAY_BASE_URL}/products/#{GIFT}/tokens/gift-1:consume"
    assert_predicate GooglePlayPurchase.sole.acknowledged_at, :present?
  end

  test '#create is idempotent for the same purchase' do
    stub_google_play_product(GIFT, 'gift-1')

    2.times { post_gift(purchase_token: 'gift-1') }

    assert_response :success
    assert_equal 1, GiftedSubscription.count
  end

  test '#create returns the original recipient when the purchase is resent for someone else' do
    stub_google_play_product(GIFT, 'gift-1')
    post_gift(purchase_token: 'gift-1')

    post_gift(purchase_token: 'gift-1', recipient_profile_id: profiles(:admin).id)

    assert_response :success
    assert_equal users(:event_responsible), GiftedSubscription.sole.user
    assert_equal profiles(:event_responsible).id, response.parsed_body.dig('gift', 'recipient', 'id')
  end

  test '#create rejects a purchase recorded for another account' do
    GooglePlayPurchase.create!(user: users(:admin), purchase_token: 'gift-1', product_id: GIFT,
                               state: 'purchased', purchased_at: 1.day.ago)
    stub_google_play_product(GIFT, 'gift-1')

    post_gift(purchase_token: 'gift-1')

    assert_response :unprocessable_content
    assert_equal users(:admin), GooglePlayPurchase.sole.user
    assert_empty GiftedSubscription.all
  end

  test '#create rejects an unpaid gift' do
    stub_google_play_product(GIFT, 'gift-1', google_play_product(purchaseState: 2))

    post_gift(purchase_token: 'gift-1')

    assert_response :unprocessable_content
    assert_empty GiftedSubscription.all
  end

  test '#create rejects a test purchase from a regular user' do
    stub_google_play_product(GIFT, 'gift-1', google_play_product(purchaseType: 0))

    post_gift(purchase_token: 'gift-1')

    assert_response :unprocessable_content
    assert_empty GiftedSubscription.all
  end

  test '#create rejects gifting to yourself' do
    post_gift(purchase_token: 'gift-1', recipient_profile_id: profiles(:regular_user).id)

    assert_response :unprocessable_content
  end

  test '#create rejects a profile without an account' do
    post_gift(purchase_token: 'gift-1', recipient_profile_id: profiles(:alex).id)

    assert_response :unprocessable_content
  end

  test 'a refunded gift purchase ends the gifted subscription' do
    stub_google_play_product(GIFT, 'gift-1')
    post_gift(purchase_token: 'gift-1')

    GooglePlayPurchase.sole.update!(revoked_at: Time.current)

    assert_not users(:event_responsible).gifted_subscriptions.sole.active?
  end

  test 'a voided gift purchase ends the gifted subscription' do
    stub_google_play_product(GIFT, 'gift-1')
    post_gift(purchase_token: 'gift-1')

    GooglePlayPurchase.sole.update!(state: 'voided')

    assert_not users(:event_responsible).gifted_subscriptions.sole.active?
  end

  test 'sent gifts are listed on the current profile' do
    stub_google_play_product(GIFT, 'gift-1')
    post_gift(purchase_token: 'gift-1', message: 'Enjoy')

    get api_v1_current_path, headers: bearer(:regular_user_read)

    gift = response.parsed_body['sentGifts'].sole
    assert_equal 'Enjoy', gift['message']
    assert_equal profiles(:event_responsible).name, gift.dig('recipient', 'name')
  end

  private

  def post_gift(**params)
    stub_google_play_product_consume(GIFT, params[:purchase_token])
    with_google_play_access do
      post api_v1_google_play_gifts_path,
           params: { product_id: GIFT, recipient_profile_id: profiles(:event_responsible).id }.merge(params),
           headers: bearer(:regular_user_write),
           as: :json
    end
  end
end
