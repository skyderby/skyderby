require 'test_helper'

class User::SubscriptionTest < ActiveSupport::TestCase
  setup do
    @user = users(:regular_user)
  end

  test 'plan is nil without a subscription' do
    assert_nil @user.subscription.plan
    assert_not @user.subscription.lifetime?
  end

  test 'plan follows the latest store purchase' do
    create_play_purchase('1', 'io.skyderby.pro.monthly', expires_at: 2.days.from_now)
    create_play_purchase('2', 'io.skyderby.pro.annual', expires_at: 300.days.from_now)

    assert_equal 'annual', @user.subscription.plan
  end

  test 'a lifetime purchase wins over a subscription' do
    create_play_purchase('1', 'io.skyderby.pro.monthly', expires_at: 20.days.from_now)
    create_play_purchase('2', 'io.skyderby.pro.lifetime', state: 'purchased', expires_at: nil)

    assert_equal 'lifetime', @user.subscription.plan
    assert_predicate @user.subscription, :lifetime?
  end

  test 'a gift without expiry is a lifetime plan' do
    GiftedSubscription.create!(user: @user, expires_at: nil)

    assert_equal 'gifted', @user.subscription.source
    assert_equal 'lifetime', @user.subscription.plan
  end

  test 'a timed gift has no plan' do
    GiftedSubscription.create!(user: @user, expires_at: 1.month.from_now)

    assert_nil @user.subscription.plan
  end

  test 'a gifted lifetime keeps a renewing store subscription manageable' do
    create_play_purchase('1', 'io.skyderby.pro.monthly', expires_at: 20.days.from_now)
    GiftedSubscription.create!(user: @user, expires_at: nil)

    assert_equal 'lifetime', @user.subscription.plan
    assert_predicate @user.subscription, :renewing?
  end

  test 'a canceled store subscription is not renewing' do
    create_play_purchase('1', 'io.skyderby.pro.monthly', state: 'canceled', expires_at: 20.days.from_now)

    assert_not @user.subscription.renewing?
  end

  private

  def create_play_purchase(token, product_id, state: 'active', expires_at: nil)
    GooglePlayPurchase.create!(user: @user, purchase_token: token, product_id:, state:, expires_at:,
                               purchased_at: 1.day.ago)
  end
end
