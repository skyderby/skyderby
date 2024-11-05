require 'test_helper'

class Api::Web::CurrentUsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @default_permissions = { 'canAccessAdminPanel' => false, 'canCreatePlace' => false, 'canManageUsers' => false }
  end

  test '#show - when authorized' do
    sign_in users(:regular_user)

    get api_v1_current_user_url

    assert_response :success
    assert response.parsed_body['authorized']
    assert_equal @default_permissions, response.parsed_body['permissions']
  end

  test '#show - when not authorized' do
    get api_v1_current_user_url

    assert_response :success
    assert_not response.parsed_body['authorized']
    assert_equal @default_permissions, response.parsed_body['permissions']
  end
end
