require 'test_helper'

class SubscriptionsTest < ActionDispatch::IntegrationTest
  test 'free user without Pro View usage sees plans with lifetime preselected and no meter' do
    user = users(:regular_user)
    sign_in user

    get subscriptions_path

    assert_response :success
    assert_select 'input[name=plan][value=lifetime][checked]'
    assert_select '.subscriptions-plans__submit', text: 'Get Pro for $59'
    assert_select '.subscriptions-usage', false
  end

  test 'usage meter shows how many free views are left' do
    user = users(:regular_user)
    FreeProView.insert_all([{ user_id: user.id, created_at: Time.current }])
    sign_in user

    get subscriptions_path

    assert_select '.subscriptions-usage__cell--left', count: FreeProView.monthly_limit - 1
    assert_select '.subscriptions-usage--exhausted', false
  end

  test 'usage meter flags an exhausted free limit' do
    user = users(:regular_user)
    FreeProView.insert_all(Array.new(FreeProView.monthly_limit) { { user_id: user.id, created_at: Time.current } })
    sign_in user

    get subscriptions_path

    assert_select '.subscriptions-usage--exhausted'
    assert_select '.subscriptions-usage__cell--left', false
  end

  test 'free user sees the Pro link in navigation' do
    sign_in users(:regular_user)

    get root_path

    assert_select '.nav-menu-item--pro a[href=?]', subscriptions_path(source: 'nav')
  end
end
