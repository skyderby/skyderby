require 'test_helper'

class Api::V1::AccountsControllerTest < ActionDispatch::IntegrationTest
  include ApiAuthHelper

  test '#destroy deletes the account' do
    user = users(:regular_user)

    delete api_v1_account_path, headers: bearer(:regular_user_write), as: :json

    assert_response :no_content
    assert_not User.exists?(user.id)
    assert_not Doorkeeper::AccessToken.exists?(token: 'regular-user-write-token')
  end

  test '#destroy requires write scope' do
    delete api_v1_account_path, headers: bearer(:regular_user_read), as: :json

    assert_response :forbidden
    assert User.exists?(users(:regular_user).id)
  end

  test '#destroy requires authentication' do
    delete api_v1_account_path, as: :json

    assert_response :unauthorized
  end

  test '#destroy is forbidden while impersonating' do
    impersonation = Impersonation.start!(admin: users(:admin), user: users(:regular_user),
                                         application: oauth_applications(:skyderby_apple))

    delete api_v1_account_path, headers: { 'Authorization' => "Bearer #{impersonation.access_token.token}" },
                                as: :json

    assert_response :forbidden
    assert User.exists?(users(:regular_user).id)
  end
end
