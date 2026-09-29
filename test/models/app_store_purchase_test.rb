require 'test_helper'

class AppStorePurchaseTest < ActiveSupport::TestCase
  setup do
    @user = users(:regular_user)
  end

  test 'active scope includes lifetime and unexpired purchases only' do
    lifetime = create_purchase(original_transaction_id: '1', product_id: 'io.skyderby.pro.lifetime', expires_at: nil)
    current = create_purchase(original_transaction_id: '2', expires_at: 1.day.from_now)
    create_purchase(original_transaction_id: '3', expires_at: 1.day.ago)
    create_purchase(original_transaction_id: '4', expires_at: nil, revoked_at: 1.hour.ago)

    assert_equal [lifetime, current].sort, AppStorePurchase.active.sort
  end

  test 'user subscription includes active app store purchase' do
    assert_not @user.subscription_active?

    create_purchase(original_transaction_id: '1', expires_at: 1.day.from_now)

    assert_predicate @user.reload, :subscription_active?
    assert_predicate @user, :subscribed?
    assert_equal 'app_store', @user.subscription.source
  end

  test 'status reflects purchase state' do
    assert_equal 'lifetime', AppStorePurchase.new(expires_at: nil).status
    assert_equal 'active', AppStorePurchase.new(expires_at: 1.day.from_now).status
    assert_equal 'expired', AppStorePurchase.new(expires_at: 1.day.ago).status
    assert_equal 'revoked', AppStorePurchase.new(revoked_at: 1.day.ago).status
  end

  private

  def create_purchase(**attributes)
    AppStorePurchase.create!(
      user: @user, transaction_id: attributes[:original_transaction_id], product_id: 'io.skyderby.pro.monthly',
      environment: 'Production', purchased_at: 2.days.ago, **attributes
    )
  end
end
