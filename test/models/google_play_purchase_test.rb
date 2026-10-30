require 'test_helper'

class GooglePlayPurchaseTest < ActiveSupport::TestCase
  setup do
    @user = users(:regular_user)
  end

  test 'active scope includes entitling states that have not expired' do
    lifetime = create_purchase(purchase_token: '1', product_id: 'io.skyderby.pro.lifetime', state: 'purchased',
                               expires_at: nil)
    current = create_purchase(purchase_token: '2', expires_at: 1.day.from_now)
    canceled = create_purchase(purchase_token: '3', state: 'canceled', expires_at: 1.day.from_now)
    grace = create_purchase(purchase_token: '4', state: 'grace_period', expires_at: 1.day.from_now)
    create_purchase(purchase_token: '5', expires_at: 1.day.ago)
    create_purchase(purchase_token: '6', state: 'on_hold', expires_at: 1.day.from_now)
    create_purchase(purchase_token: '7', state: 'pending', expires_at: 1.day.from_now)
    create_purchase(purchase_token: '8', product_id: 'io.skyderby.pro.lifetime', state: 'voided', expires_at: nil)
    create_purchase(purchase_token: '9', expires_at: 1.day.from_now, revoked_at: 1.hour.ago)

    assert_equal [lifetime, current, canceled, grace].sort, GooglePlayPurchase.active.sort
  end

  test 'user subscription includes an active Google Play purchase' do
    assert_not @user.subscription_active?

    purchase = create_purchase(purchase_token: '1', expires_at: 1.day.from_now)

    assert_predicate @user.reload, :subscription_active?
    assert_predicate @user, :subscribed?
    assert_equal 'google_play', @user.subscription.source
    assert_equal purchase.expires_at, @user.subscription.expires_at
  end

  test 'a test purchase does not give Pro' do
    create_purchase(purchase_token: '1', expires_at: 1.day.from_now, test_purchase: true)

    assert_not @user.reload.subscription_active?
    assert_empty GooglePlayPurchase.entitling
  end

  test 'the daily status job keeps Google Play subscribers subscribed' do
    create_purchase(purchase_token: '1', expires_at: 1.day.from_now)
    @user.update_column(:subscribed, false)

    SubscriptionStatusJob.perform_now

    assert_predicate @user.reload, :subscribed?
  end

  test 'status reflects purchase state' do
    assert_equal 'lifetime', GooglePlayPurchase.new(product_id: 'io.skyderby.pro.lifetime', state: 'purchased').status
    assert_equal 'active', GooglePlayPurchase.new(state: 'active', expires_at: 1.day.from_now).status
    assert_equal 'expired', GooglePlayPurchase.new(state: 'active', expires_at: 1.day.ago).status
    assert_equal 'expired', GooglePlayPurchase.new(state: 'on_hold', expires_at: 1.day.from_now).status
    assert_equal 'revoked', GooglePlayPurchase.new(state: 'active', revoked_at: 1.day.ago).status
  end

  private

  def create_purchase(**attributes)
    GooglePlayPurchase.create!(
      { user: @user, product_id: 'io.skyderby.pro.monthly', state: 'active', purchased_at: 1.day.ago }
        .merge(attributes)
    )
  end
end
