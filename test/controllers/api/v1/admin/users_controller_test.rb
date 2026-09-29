require 'test_helper'

class Api::V1::Admin::UsersControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#index searches users by name and email' do
    get api_v1_admin_users_path, params: { term: 'regular' }, headers: bearer(:admin_read)

    assert_response :success
    items = response.parsed_body['items']
    assert_equal [users(:regular_user).id], items.pluck('id')
    assert_equal 'alex@example.com', items.first['email']
    assert_equal profiles(:regular_user).id, items.first.dig('profile', 'id')
    assert_equal 'Regular user', items.first.dig('profile', 'name')
    assert_equal '/images/thumb/missing.png', items.first.dig('profile', 'photo', 'thumb')

    get api_v1_admin_users_path, params: { term: 'event_responsible@' }, headers: bearer(:admin_read)

    assert_equal [users(:event_responsible).id], response.parsed_body['items'].pluck('id')
  end

  test '#index limits results to 20' do
    21.times { |i| User.create!(email: "bulk#{i}@example.com", password: 'password123', confirmed_at: Time.current) }

    get api_v1_admin_users_path, params: { term: 'bulk' }, headers: bearer(:admin_read)

    assert_equal 20, response.parsed_body['items'].size
  end

  test '#index is forbidden for non-admins' do
    get api_v1_admin_users_path, params: { term: 'a' }, headers: bearer(:regular_user_write)

    assert_response :forbidden
  end

  test '#index requires authentication' do
    get api_v1_admin_users_path, params: { term: 'a' }

    assert_response :unauthorized
  end

  test '#index is forbidden with an impersonation token' do
    impersonation = Impersonation.start!(admin: users(:admin), user: users(:regular_user),
                                         application: oauth_applications(:skyderby_apple))
    users(:regular_user).update!(roles: ['admin'])

    get api_v1_admin_users_path, params: { term: 'a' },
                                 headers: { 'Authorization' => "Bearer #{impersonation.access_token.token}" }

    assert_response :forbidden
  end
end
