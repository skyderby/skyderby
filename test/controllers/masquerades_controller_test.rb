require 'test_helper'

class MasqueradesControllerTest < ActionDispatch::IntegrationTest
  test 'regular user cannot masquerade as another user' do
    sign_in users(:regular_user)

    post user_masquerades_path(users(:admin))

    assert_response :forbidden
  end

  test 'admin can masquerade and stop' do
    sign_in users(:admin)

    post user_masquerades_path(users(:regular_user))
    assert_redirected_to root_path

    delete user_masquerades_path(users(:admin))
    assert_redirected_to root_path
  end
end
