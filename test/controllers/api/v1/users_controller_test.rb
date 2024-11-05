require 'test_helper'

class Api::Web::UsersControllerTest < ActionDispatch::IntegrationTest
  test '#index - is not allowed for guest users' do
    get api_v1_users_url

    assert_response :forbidden
  end

  test '#index - is not allowed for non-admin users' do
    sign_in users(:regular_user)

    get api_v1_users_url

    assert_response :forbidden
  end

  test '#index - is allowed for admin users' do
    sign_in users(:admin)

    get api_v1_users_url

    assert_response :success
    assert_equal User.count, response.parsed_body['items'].count
    assert_equal 1, response.parsed_body['currentPage']
    assert_equal 1, response.parsed_body['totalPages']
    assert_equal(
      %w[confirmed createdAt email id name oauth signInCount],
      response.parsed_body['items'].first.keys.sort
    )
  end
end
