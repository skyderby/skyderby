require 'test_helper'

class Profiles::DeletionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    sign_in users(:admin)
    @user = users(:regular_user)
    @profile = @user.profile
  end

  test 'new renders the confirmation modal' do
    get new_profile_deletion_path(@profile), as: :turbo_stream

    assert_response :success
    assert_match @user.email, @response.body
  end

  test 'create deletes the profile and keeps the user by default' do
    assert_difference -> { Profile.count }, -1 do
      assert_no_difference -> { User.count } do
        post profile_deletion_path(@profile), as: :turbo_stream
      end
    end

    assert_redirected_to profiles_path
    assert_nil @user.reload.profile
  end

  test 'create deletes the user too when requested' do
    assert_difference ['Profile.count', 'User.count'], -1 do
      post profile_deletion_path(@profile),
           params: { profile_deletion: { delete_user: '1' } }, as: :turbo_stream
    end

    assert_redirected_to profiles_path
    assert_nil User.find_by(id: @user.id)
  end

  test 'create is forbidden for non-admins' do
    sign_in users(:regular_user)

    assert_no_difference -> { Profile.count } do
      post profile_deletion_path(@profile), as: :turbo_stream
    end
  end
end
