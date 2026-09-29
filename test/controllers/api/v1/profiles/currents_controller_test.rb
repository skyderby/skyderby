require 'test_helper'

class Api::V1::Profiles::CurrentsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#show requires authentication' do
    get api_v1_current_path

    assert_response :unauthorized
    assert_equal ['Authentication required'], response.parsed_body['errors']
  end

  test '#show renders user, profile, subscription and free pro views' do
    user = users(:regular_user)
    profile = profiles(:regular_user)

    get api_v1_current_path, headers: bearer(:regular_user_read)

    assert_response :success
    body = response.parsed_body
    assert_equal profile.id, body['id']
    assert_equal profile.name, body['name']
    assert_equal({ 'id' => user.id, 'email' => user.email, 'admin' => false }, body['user'])
    assert_equal profile.id, body.dig('profile', 'id')
    assert_equal '/images/thumb/missing.png', body.dig('profile', 'photo', 'thumb')
    assert_equal({ 'active' => false, 'source' => nil, 'expiresAt' => nil }, body['subscription'])
    assert_equal 5, body.dig('freeProViews', 'remaining')
  end

  test '#show reports app store subscription' do
    expires_at = 20.days.from_now.change(usec: 0)
    AppStorePurchase.create!(
      user: users(:regular_user), original_transaction_id: '1', transaction_id: '2',
      product_id: 'io.skyderby.pro.annual', environment: 'Production',
      purchased_at: 1.day.ago, expires_at:
    )

    get api_v1_current_path, headers: bearer(:regular_user_read)

    assert_equal(
      { 'active' => true, 'source' => 'app_store', 'expiresAt' => expires_at.iso8601 },
      response.parsed_body['subscription']
    )
  end

  test '#show reports admin subscription' do
    get api_v1_current_path, headers: bearer(:admin_write)

    assert_equal({ 'active' => true, 'source' => 'admin', 'expiresAt' => nil }, response.parsed_body['subscription'])
    assert response.parsed_body.dig('user', 'admin')
  end

  test '#show reports the impersonating admin' do
    impersonation = Impersonation.start!(admin: users(:admin), user: users(:regular_user),
                                         application: oauth_applications(:skyderby_apple))

    get api_v1_current_path, headers: { 'Authorization' => "Bearer #{impersonation.access_token.token}" }

    assert_response :success
    body = response.parsed_body
    assert_equal users(:regular_user).id, body.dig('user', 'id')
    assert_equal(
      { 'id' => users(:admin).id, 'name' => 'Admin profile', 'expiresAt' => impersonation.expires_at.iso8601 },
      body['impersonatedBy']
    )
  end

  test '#show omits impersonatedBy for regular tokens' do
    get api_v1_current_path, headers: bearer(:regular_user_read)

    assert_not response.parsed_body.key?('impersonatedBy')
  end
end
