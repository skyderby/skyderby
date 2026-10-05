require 'test_helper'

class Users::RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test 'account settings show the delete account action' do
    sign_in users(:regular_user)

    get edit_profile_path(profiles(:regular_user))

    assert_response :success
    assert_select 'form[action=?][data-turbo-confirm]', user_registration_path do
      assert_select 'input[name=_method][value=delete]'
    end
  end

  test 'admins editing another profile do not see delete account' do
    sign_in users(:admin)

    get edit_profile_path(profiles(:regular_user))

    assert_response :success
    assert_select 'form[action=?][data-turbo-confirm]', user_registration_path, count: 0
  end

  test '#destroy deletes the account and signs out' do
    user = users(:regular_user)
    sign_in user

    delete user_registration_path

    assert_redirected_to root_path
    assert_equal 'Your account has been deleted.', flash[:notice]
    assert_not User.exists?(user.id)
  end

  test '#destroy requires sign in' do
    delete user_registration_path

    assert_redirected_to new_user_session_path
  end
end
